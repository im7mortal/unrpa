import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ModelViewer from './ModelViewer';
import ErrorBoundary from "./ErrorBoundary"; // Importing the ModelViewer component

function ElementExtraction() {
    const [dthdId, setDthdId] = useState("781c2417-2420-4c2c-bd42-142e606a0302");
    const [startDate, setStartDate] = useState("2024-09-10");
    const [endDate, setEndDate] = useState("2024-09-20");
    const [scanIds, setScanIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedModelUrl, setSelectedModelUrl] = useState(""); // New state for selected model URL

    const handleFetchData = () => {
        if (!dthdId || !startDate || !endDate) {
            console.error("Please provide all inputs before fetching data");
            return;
        }

        setLoading(true);
        const apiUrl = `https://digitaltwin.sturfee.com/hd`;

        fetch(apiUrl + `/layout/` + dthdId + "?full_details=True", {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
            .then((response) => response.json())
            .then((data) => {

                console.log(data)

                const fetchedScanIds = data.scanMeshes
                    ? data.scanMeshes.filter(scan => {
                        if (["INIT", "RAW_READY", "TEXTURED_READY"].includes(scan.status) &&
                            ["ACTIVE_TEXTURED", "ACTIVE"].includes(scan.dtScanStatus)) {

                            const createdDate = new Date(scan.createdDate.split('T')[0]);
                            const start = new Date(startDate);
                            const end = new Date(endDate);

                            return createdDate >= start && createdDate <= end && scan.scanMeshUrl !== null;
                        }
                        return false;
                    }).map(scan => ({
                        id: scan.dtHdScanId,
                        scanMeshUrl: scan.scanMeshUrl // Store the scanMeshUrl for later use
                    }))
                    : [];

                setScanIds(fetchedScanIds);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching API data:", error);
                setLoading(false);
            });
    };

    return (
        <div>
            {/* Input field for dthdId */}
            <div className="col mt-4">
                <label htmlFor="dthdId" className="form-label">Enter DTHD ID:</label>
                <input
                    type="text"
                    id="dthdId"
                    className="form-control"
                    value={dthdId}
                    onChange={(e) => setDthdId(e.target.value)}
                    placeholder="Enter the DTHD ID"
                />
            </div>

            {/* Date pickers */}
            <div className="col mt-4">
                <label htmlFor="startDate" className="form-label">Start Date:</label>
                <input
                    type="date"
                    id="startDate"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>

            <div className="col mt-4">
                <label htmlFor="endDate" className="form-label">End Date:</label>
                <input
                    type="date"
                    id="endDate"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>

            {/* Button to trigger API call */}
            <div className="col mt-4">
                <button className="btn btn-primary" onClick={handleFetchData} disabled={loading}>
                    {loading ? 'Fetching...' : 'Fetch Data'}
                </button>
            </div>

            {/* Display the list of scan IDs */}
            <div className="col mt-4">
                {scanIds.length > 0 && (
                    <div>
                        <h4>Select Scan ID</h4>
                        {scanIds.map(scan => (
                            <div key={scan.id} className="form-check">
                                <a href="#" onClick={() => setSelectedModelUrl(scan.scanMeshUrl)}>
                                    {scan.id}
                                </a>
                            </div>
                        ))}
                    </div>
                )}

                {loading && <p>Loading scan IDs...</p>}
                {!loading && scanIds.length === 0 && <p>No scan IDs available within the selected date range.</p>}
            </div>

            {/* Model Viewer - show the selected model */}
            {selectedModelUrl && (
                <div className="col mt-4">
                    <h4>3D Model Viewer</h4>
                    <ErrorBoundary>
                        <ModelViewer modelUrl={selectedModelUrl} />
                    </ErrorBoundary>
                </div>
            )}
        </div>
    );
}

export default ElementExtraction;
