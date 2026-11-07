import { createRoot } from 'react-dom/client';
import '@kashi-ui/css';
import './styles.css';
import Workspace from './Workspace';

createRoot(document.getElementById('root')!).render(<Workspace />);
