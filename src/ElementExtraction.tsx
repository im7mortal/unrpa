import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function ElementExtraction() {
    // Set default values for dthdId, startDate, and endDate
    const [dthdId, setDthdId] = useState("781c2417-2420-4c2c-bd42-142e606a0302");
    const [startDate, setStartDate] = useState("2024-09-10");
    const [endDate, setEndDate] = useState("2024-09-20");

    const handleFetchData = () => {
        if (!dthdId || !startDate || !endDate) {
            console.error("Please provide all inputs before fetching data");
            return;
        }

        // URL to the API
        const apiUrl = `https://digitaltwin.sturfee.com/hd`;

        // Add proxy for CORS issue handling during development (for production, resolve CORS on the server side)
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // Only for development testing
        console.log(apiUrl + `/layout/` + dthdId)
        fetch(apiUrl + `/layout/` + dthdId + "?full_details=True", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // body: JSON.stringify({
            //     dthdId,
            //     startDate,
            //     endDate,
            // }),
        })
            .then((response) => response.json())
            .then((data) => {
                // Print the output in the console
                console.log("API Response:", data);
            })
            .catch((error) => {
                console.error("Error fetching API data:", error);
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
                <button
                    className="btn btn-primary"
                    onClick={handleFetchData}
                >
                    Fetch Data
                </button>
            </div>
        </div>
    );
}

export default ElementExtraction;
