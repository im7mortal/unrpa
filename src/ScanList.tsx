import React, { useContext } from 'react';
import { DigitalTwinContext } from './ContextDigitalTween';

function ScanList() {
    const { digitalTwins } = useContext(DigitalTwinContext);
    console.log(digitalTwins)
    return (
        <div className="col mt-4">
            {digitalTwins.length > 0 && (
                <div>
                    <h4>Select Scan ID</h4>
                    {digitalTwins[0].scanMeshes.map(scan => (
                        <div key={scan.dtHdScanId} className="form-check">
                            <a href="#" onClick={() => console.log(scan.scanMeshUrl)}>
                                {scan.dtHdScanId}
                            </a>
                        </div>
                    ))}
                </div>
            )}
            {digitalTwins.length === 0 && <p>No digital twins available.</p>}
        </div>
    );
}

export default ScanList;
