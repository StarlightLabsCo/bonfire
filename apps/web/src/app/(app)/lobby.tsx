import New from './new';
import Resume from './resume';

export default function Lobby() {
  const ongoingInstance = false;

  return ongoingInstance ? <Resume /> : <New />;
}
