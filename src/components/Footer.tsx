import { T } from '@/i18n/LangProvider';
import { asset } from '@/lib/asset';
import { Mark } from './Mark';

export default function Footer() {
  const home = asset('/');
  return (
    <footer>
      <div className="wrap">
        <a className="logo" href={`${home}#top`} aria-label="Ifiok"><Mark style={{ width: 19 }} /></a>
        <nav aria-label="Footer">
          <a href={`${home}#templates`}><T k="nav.templates">Templates</T></a>
          <a href={`${home}#features`}><T k="nav.features">Features</T></a>
          <a href={asset('/get-app/')}><T k="nav.apps">Apps</T></a>
          <a href={asset('/student/')}><T k="nav.students">Students</T></a>
          <a href={`${home}#tools`}><T k="nav.tools">Free tools</T></a>
          <a href={asset('/creators/')}><T k="nav.creators">Creators</T></a>
        </nav>
        <span>© Ifiok</span>
      </div>
    </footer>
  );
}
