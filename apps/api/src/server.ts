import { createServer } from 'node:http';
import { ControlPlaneService } from '../../../packages/control-plane/src/index.js';

const service = ControlPlaneService.createDefault();

const server = createServer(async (req, res) => {
  if (!req.url) {
    res.statusCode = 400;
    res.end('Missing URL');
    return;
  }

  if (req.url === '/health') {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true, service: 'choklit-control-plane' }));
    return;
  }

  if (req.url.startsWith('/timeline')) {
    const events = service.getTimeline('demo-user');
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(events));
    return;
  }

  res.statusCode = 404;
  res.end('Not found');
});

server.listen(8080, () => {
  console.log('Choklit control plane listening on :8080');
});
