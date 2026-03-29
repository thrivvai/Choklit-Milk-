import Link from 'next/link';

const routes = [
  ['Welcome', '/welcome'],
  ['Connect Telegram', '/connect-telegram'],
  ['Setup Interview', '/setup-interview'],
  ['Permission Setup', '/permission-setup'],
  ['Home Dashboard', '/home'],
  ['Action Card Drawer', '/action-cards'],
  ['Timeline', '/timeline'],
  ['Skills Shelf', '/skills'],
  ['Memory Editor', '/memory'],
  ['Panic Mode', '/panic'],
  ['Settings', '/settings']
];

export default function IndexPage() {
  return (
    <main style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
      <h1>Choklit Milk MVP Cockpit</h1>
      <p>One assistant. One operator. Visible approvals and calm defaults.</p>
      <ul>
        {routes.map(([label, href]) => (
          <li key={href}>
            <Link href={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
