import New from './new';
import Resume from './resume';

export default function Lobby() {
  const ongoingInstance = true;

  return ongoingInstance ? <Resume /> : <New />;
}
