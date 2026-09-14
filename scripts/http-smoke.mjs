import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';

async function withServer(environment, port, verify) {
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    env: { ...process.env, NODE_ENV: 'production', APP_ENV: environment,
      VERCEL_ENV: environment, DATA_MODE: 'demo', NEXT_TELEMETRY_DISABLED: '1',
      MERCADO_LIVRE_ENABLED: 'false', TELEGRAM_ENABLED: 'false' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let logs = '';
  child.stdout.on('data', data => { logs += data; });
  child.stderr.on('data', data => { logs += data; });
  const origin = `http://127.0.0.1:${port}`;
  const get = async path => {
    const response = await fetch(origin + path, { redirect: 'manual' });
    return { response, text: await response.text() };
  };
  try {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      if (child.exitCode !== null) throw new Error(logs);
      try { await fetch(origin, { signal: AbortSignal.timeout(1000) }); ready = true; break; }
      catch { await delay(100); }
    }
    assert.ok(ready, `Servidor indisponível: ${logs}`);
    await verify(get);
    console.log(`PASS HTTP ${environment}`);
  } finally {
    if (child.exitCode === null) {
      child.kill('SIGTERM');
      await once(child, 'exit');
    }
  }
}

await withServer('preview', 3101, async get => {
  const home = await get('/');
  assert.equal(home.response.status, 200);
  assert.match(home.text, /Ambiente de demonstração/);
  assert.match(home.text, /Fone sem fio com cancelamento/);
  assert.doesNotMatch(home.text, /demo-7|demo-8|Fone de ouvido em revisão/);
  assert.equal(home.response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(home.response.headers.get('x-robots-tag'), 'noindex, nofollow');
  for (const path of ['/admin', '/admin/produtos', '/admin/ofertas', '/admin/publicacoes', '/sobre', '/entrar']) assert.equal((await get(path)).response.status, 200, path);
  assert.equal((await get('/ofertas/fone-em-revisao')).response.status, 404);
  assert.equal((await get('/ofertas/inexistente')).response.status, 404);
  assert.match((await get('/ofertas/luminaria-encerrada')).text, /Exemplo encerrado/);
  assert.match((await get('/ofertas/fone-sem-fio')).text, /Compra indisponível/);
  assert.match((await get('/admin/publicacoes')).text, /Envio indisponível/);
});
await withServer('production', 3102, async get => {
  const home = await get('/');
  assert.equal(home.response.status, 200);
  assert.match(home.text, /Em breve, por aqui/);
  assert.doesNotMatch(home.text, /demo-1|249,90|Fone sem fio/);
  for (const path of ['/admin', '/admin/produtos', '/admin/ofertas', '/admin/publicacoes']) {
    const result = await get(path);
    assert.equal(result.response.status, 307, path);
    assert.equal(result.response.headers.get('location'), '/entrar', path);
    assert.doesNotMatch(result.text, /demo-1|demo-7/);
  }
  assert.equal((await get('/ofertas/fone-sem-fio')).response.status, 404);
  assert.match((await get('/entrar')).text, /Acesso ainda indisponível/);
});
