import { VariableSizeList } from "react-window";
import { useLogs } from './ContextLog';
const Logs = () => {
    const { logs } = useLogs();
    const getItemSize = (index:number) :number => {
        // it can be usefull for soft wrapping in the future
        return 20;
    };
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
        <div style={style}>
            <div style={{ textAlign: "left" }}>{logs[index]}</div>
        </div>
    );

    return (
        <VariableSizeList
            width={1000}
            height={400}
            itemCount={logs.length}
            itemSize={getItemSize}
        >
            {Row}
        </VariableSizeList>
    );
};

export default Logs;