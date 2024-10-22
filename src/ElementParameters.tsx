import React, { useState } from 'react';

interface ElementParametersProps {
    onSubmit: (parameters: Parameters) => void;
}

interface Parameters {
    textureSize: string;
    pageCount: string;
    imagesIntervalForTexturing: string;
    voxelSize: string;
    decimateMesh: string;
    clusterThreshold: string;
    makeYUp: boolean;
    selectedOptions: string[];
}

const ElementParameters: React.FC<ElementParametersProps> = ({ onSubmit }) => {
    // Parameters state
    const [textureSize, setTextureSize] = useState<string>("4096");
    const [pageCount, setPageCount] = useState<string>("1");
    const [imagesIntervalForTexturing, setImagesIntervalForTexturing] = useState<string>("10");
    const [voxelSize, setVoxelSize] = useState<string>("0.015");
    const [decimateMesh, setDecimateMesh] = useState<string>("70");
    const [clusterThreshold, setClusterThreshold] = useState<string>("100");
    const [makeYUp, setMakeYUp] = useState<boolean>(false); // Checkbox for "Make Y Up"

    // Options state
    const options = [
        { text: "Run TSDF", value: "runTsdf" },
        { text: "Run TSDF Texture", value: "runTsdfTexture" },
        { text: "Run Photogrammetry", value: "runPhotogrammetry" },
        { text: "Run Video", value: "runVideo" },
        { text: "Run Media", value: "runMedia" }
    ];

    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    const handleOptionChange = (optionValue: string) => {
        setSelectedOptions(prevSelected =>
            prevSelected.includes(optionValue)
                ? prevSelected.filter(item => item !== optionValue)
                : [...prevSelected, optionValue]
        );
    };

    const handleSubmit = () => {
        const parameters: Parameters = {
            textureSize,
            pageCount,
            imagesIntervalForTexturing,
            voxelSize,
            decimateMesh,
            clusterThreshold,
            makeYUp,
            selectedOptions
        };
        onSubmit(parameters);
    };

    return (
        <div className="col mt-4">
            <h4>Enter Parameters</h4>
            <div className="row">
                {/* Left column for input fields */}
                <div className="col-md-6">
                    <div className="form-group row">
                        <label className="col-sm-4 col-form-label">Texture Size</label>
                        <div className="col-sm-8">
                            <input
                                type="text"
                                className="form-control"
                                value={textureSize}
                                onChange={(e) => setTextureSize(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group row mt-3">
                        <label className="col-sm-4 col-form-label">Page Count</label>
                        <div className="col-sm-8">
                            <input
                                type="text"
                                className="form-control"
                                value={pageCount}
                                onChange={(e) => setPageCount(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group row mt-3">
                        <label className="col-sm-4 col-form-label">Images Interval for Texturing</label>
                        <div className="col-sm-8">
                            <input
                                type="text"
                                className="form-control"
                                value={imagesIntervalForTexturing}
                                onChange={(e) => setImagesIntervalForTexturing(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group row mt-3">
                        <label className="col-sm-4 col-form-label">Voxel Size</label>
                        <div className="col-sm-8">
                            <input
                                type="text"
                                className="form-control"
                                value={voxelSize}
                                onChange={(e) => setVoxelSize(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group row mt-3">
                        <label className="col-sm-4 col-form-label">Decimate Mesh</label>
                        <div className="col-sm-8">
                            <input
                                type="text"
                                className="form-control"
                                value={decimateMesh}
                                onChange={(e) => setDecimateMesh(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group row mt-3">
                        <label className="col-sm-4 col-form-label">Cluster Threshold</label>
                        <div className="col-sm-8">
                            <input
                                type="text"
                                className="form-control"
                                value={clusterThreshold}
                                onChange={(e) => setClusterThreshold(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Checkbox for Make Y Up */}
                    <div className="form-group row mt-3">
                        <label className="col-sm-4 col-form-label">Make Y Up</label>
                        <div className="col-sm-8">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                checked={makeYUp}
                                onChange={() => setMakeYUp(!makeYUp)}
                            />
                        </div>
                    </div>
                </div>


                {/* Right column for checkboxes */}
                <div className="col-md-6">
                    <h4>Select Processes to Run</h4>
                    {options.map(option => (
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
                </div>
            </div>

            {/* Submit Button */}
            <button className="btn btn-success mt-3" onClick={handleSubmit}>
                Submit Options
            </button>
        </div>
    );
}

export default ElementParameters;
