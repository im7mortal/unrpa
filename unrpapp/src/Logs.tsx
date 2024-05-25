import { FixedSizeList } from 'react-window';
import { useLogs } from './LogProvider';
const Logs = () => {
    const { logs } = useLogs();

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
        <div style={style}>
            {logs[index]}
        </div>
    );

    return (
        <FixedSizeList
            width={500}
            height={400}
            itemCount={logs.length}
            itemSize={35}
        >
            {Row}
        </FixedSizeList>
    );
};

export default Logs;