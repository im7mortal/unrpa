import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function ElementExtraction() {
    // Set default values for dthdId, startDate, and endDate
    const [dthdId, setDthdId] = useState("781c2417-2420-4c2c-bd42-142e606a0302");
    const [startDate, setStartDate] = useState("2024-09-10");
    const [endDate, setEndDate] = useState("2024-09-20");

    // State to hold the fetched scanIds
    const [scanIds, setScanIds] = useState([]);
    const [loading, setLoading] = useState(false); // Track loading state

    const handleFetchData = () => {
        if (!dthdId || !startDate || !endDate) {
            console.error("Please provide all inputs before fetching data");
            return;
        }

        setLoading(true); // Start loading
        const apiUrl = `https://digitaltwin.sturfee.com/hd`;

        // Fetch the layout with full details
        fetch(apiUrl + `/layout/` + dthdId + "?full_details=True", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then((data) => {
                // Extract scan IDs from the fetched data
                const fetchedScanIds = data.scanMeshes ? data.scanMeshes.map(scan => scan.dtHdScanId) : [];
                setScanIds(fetchedScanIds); // Set scan IDs in the state
                setLoading(false); // End loading
            })
            .catch((error) => {
                console.error("Error fetching API data:", error);
                setLoading(false); // End loading in case of error
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

            {/* Display the list of checkboxes with scanIds */}
            <div className="col mt-4">
                {scanIds.length > 0 && (
                    <div>
                        <h4>Select Scan IDs</h4>
                        {scanIds.map((scanId) => (
                            <div key={scanId} className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    value={scanId}
                                    id={scanId}
                                />
                                <label className="form-check-label" htmlFor={scanId}>
                                    {scanId}
                                </label>
                            </div>
                        ))}
                    </div>
                )}

                {loading && <p>Loading scan IDs...</p>}
                {!loading && scanIds.length === 0 && <p>No scan IDs available.</p>}
            </div>
        </div>
    );
}

export default ElementExtraction;
