import MapView from '@/components/MapView/MapView';
import Sidebar from '@/components/Sidebar/Sidebar';
import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.appShell}>
      <Sidebar />
      <MapView />
    </div>
  );
}
