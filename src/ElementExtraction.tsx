import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function ElementExtraction() {
    // Set default values for dthdId, startDate, endDate, and scanId
    const [dthdId, setDthdId] = useState("781c2417-2420-4c2c-bd42-142e606a0302");
    const [startDate, setStartDate] = useState("2024-09-10");
    const [endDate, setEndDate] = useState("2024-09-20");
    const [scanId, setScanId] = useState(""); // New optional scanId field

    // State to hold the fetched scanIds
    const [scanIds, setScanIds] = useState([]);
    const [loading, setLoading] = useState(false); // Track loading state
    const [showOptions, setShowOptions] = useState(false); // Control options display

    // Options for the modal (mocking the trigger_options_modal logic)
    const options = [
        { text: "Run TSDF", value: "runTsdf" },
        { text: "Run TSDF Texture", value: "runTsdfTexture" },
        { text: "Run Photogrammetry", value: "runPhotogrammetry" },
        { text: "Run Video", value: "runVideo" },
        { text: "Run Media", value: "runMedia" }
    ];

    // State for selected options
    const [selectedOptions, setSelectedOptions] = useState([]);

    // Function to handle option selection
    const handleOptionChange = (optionValue) => {
        setSelectedOptions((prevSelected) =>
            prevSelected.includes(optionValue)
                ? prevSelected.filter((item) => item !== optionValue)
                : [...prevSelected, optionValue]
        );
    };

    // Function to convert date string to Date object for comparison
    const parseDate = (dateString) => {
        return new Date(dateString.split('T')[0]); // Take only the date part (ignore time)
    };

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
                // Extract scan IDs and filter based on additional conditions
                const fetchedScanIds = data.scanMeshes
                    ? data.scanMeshes.filter(scan => {
                        // Check the status conditions
                        if (["INIT", "RAW_READY", "TEXTURED_READY"].includes(scan.status) &&
                            ["ACTIVE_TEXTURED", "ACTIVE"].includes(scan.dtScanStatus)) {

                            // Check if scanMeshUrl is not null
                            if (scan.scanMeshUrl !== null) {

                                // Date-based filtering
                                const createdDate = parseDate(scan.createdDate);
                                const start = new Date(startDate);
                                const end = new Date(endDate);

                                if (createdDate >= start && createdDate <= end) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }).map(scan => scan.dtHdScanId)
                    : [];

                setScanIds(fetchedScanIds); // Set scan IDs in the state
                setLoading(false); // End loading
                setShowOptions(true); // Show options after scans are fetched
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
                {!loading && scanIds.length === 0 && <p>No scan IDs available within the selected date range.</p>}
            </div>

            {/* Display options checkboxes after scans are shown */}
            {showOptions && (
                <div className="col mt-4">
                    <h4>Select Processes to Run</h4>
                    {options.map((option) => (
                        <div key={option.value} className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                value={option.value}
                                id={option.value}
                                checked={selectedOptions.includes(option.value)}
                                onChange={() => handleOptionChange(option.value)}
                            />
                            <label className="form-check-label" htmlFor={option.value}>
                                {option.text}
                            </label>
                        </div>
                    ))}
                    <button
                        className="btn btn-success mt-3"
                        onClick={() => console.log("Selected options:", selectedOptions)}
                    >
                        Submit Options
                    </button>
                </div>
            )}
        </div>
    );
}

export default ElementExtraction;
