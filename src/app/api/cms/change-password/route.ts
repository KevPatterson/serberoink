import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createAdminCookieValue,
  getAdminPassword,
  isValidAdminCookie,
  secureEqual,
} from '@/lib/cms-auth';
import { checkRateLimit } from '@/lib/cms-rate-limit';
import { getClientIp } from '@/lib/request-ip';
import { isSameOriginRequest } from '@/lib/request-origin';

interface ChangePasswordBody {
  currentPassword?: string;
  newPassword?: string;
}

interface VercelEnvVar {
  id: string;
  key: string;
  target?: string | string[];
}

export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req.headers)) {
    return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
  }

  const adminCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value ?? null;
  if (!isValidAdminCookie(adminCookie)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip = getClientIp(req.headers);
  if (!(await checkRateLimit(`change-password:${ip}`, 5, 60_000))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: ChangePasswordBody;
  try {
    body = (await req.json()) as ChangePasswordBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const currentPassword = body.currentPassword || '';
  const newPassword = body.newPassword || '';

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
  }

  const expectedHash = createAdminCookieValue(currentPassword);
  const currentHash = createAdminCookieValue(getAdminPassword());
  if (!secureEqual(expectedHash, currentHash)) {
    return NextResponse.json({ error: 'Contrasena actual incorrecta' }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: 'La nueva contrasena debe tener al menos 8 caracteres' },
      { status: 400 }
    );
  }

  const vercelToken = process.env.VERCEL_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID;
  if (!vercelToken || !vercelProjectId) {
    return NextResponse.json(
      { error: 'Faltan VERCEL_TOKEN o VERCEL_PROJECT_ID en el servidor' },
      { status: 500 }
    );
  }

  const envListRes = await fetch(`https://api.vercel.com/v10/projects/${vercelProjectId}/env`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${vercelToken}`,
    },
  });

  if (!envListRes.ok) {
    return NextResponse.json({ error: 'No se pudo conectar con Vercel API' }, { status: 500 });
  }

  const envList = (await envListRes.json()) as { envs?: VercelEnvVar[] };
  const adminPasswordEnvs = (envList.envs || []).filter((env) => env.key === 'ADMIN_PASSWORD');

  const currentTarget = process.env.VERCEL_ENV;
  const matchingTargetEnvs = adminPasswordEnvs.filter((env) => {
    if (!currentTarget) return false;
    if (Array.isArray(env.target)) {
      return env.target.includes(currentTarget);
    }
    return env.target === currentTarget;
  });

  const envsToUpdate = matchingTargetEnvs.length > 0 ? matchingTargetEnvs : adminPasswordEnvs;

  if (envsToUpdate.length === 0) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD no encontrada en Vercel' }, { status: 500 });
  }

  const updateResults = await Promise.all(
    envsToUpdate.map((envVar) =>
      fetch(`https://api.vercel.com/v10/projects/${vercelProjectId}/env/${envVar.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: newPassword }),
      })
    )
  );

  if (updateResults.some((res) => !res.ok)) {
    return NextResponse.json(
      { error: 'No se pudo actualizar la contrasena en Vercel' },
      { status: 500 }
    );
  }

  process.env.ADMIN_PASSWORD = newPassword;

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return response;
}
