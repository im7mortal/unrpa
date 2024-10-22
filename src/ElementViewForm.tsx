import React, {useState} from "react";
import uuid from "uuid";

const ElementViewForm = () => {
    const [dtHdId, setDtHdId] = useState('781c2417-2420-4c2c-bd42-142e606a0302');
    const [startDate, setStartDate] = useState('2024-09-10');
    const [endDate, setEndDate] = useState('2024-09-20');
    const [compNum, setCompNum] = useState(1);
    const [s3Bucket, setS3Bucket] = useState('');
    const [pathOutput, setPathOutput] = useState('');
    const [textureSize, setTextureSize] = useState(4096);
    const [pageCount, setPageCount] = useState(1);
    const [imagesIntervalForTexturing, setImagesIntervalForTexturing] = useState(10);
    const [voxelSize, setVoxelSize] = useState(0.015);
    const [decimateMesh, setDecimateMesh] = useState(70);
    const [clusterThreshold, setClusterThreshold] = useState(100);
    const [makeYUp, setMakeYUp] = useState(true);
    const [errors, setErrors] = useState({});
    const [finalConfig, setFinalConfig] = useState(null);

    const isValidUuid = (value) => {
        try {
            return uuid.validate(value) && uuid.version(value) === 4;
        } catch (e) {
            return false;
        }
    };

    const isValidS3Bucket = (bucketName) => {
        return bucketName.length > 0;
    };

    const isValidPathOutput = (path) => {
        return path.length > 0 && path.startsWith('/');
    };

    const handleSubmit = () => {
        const validationErrors = {};

        if (!isValidUuid(dtHdId)) {
            validationErrors.dtHdId = "Invalid dtHdId. Please enter a valid UUID.";
        }

        if (!startDate) {
            validationErrors.startDate = "Start Date is required.";
        }

        if (!endDate) {
            validationErrors.endDate = "End Date is required.";
        }

        if (new Date(startDate) > new Date(endDate)) {
            validationErrors.endDate = "End date must be after start date.";
        }

        if (compNum < 1 || compNum > 6) {
            validationErrors.compNum = "Comp Num should be between 1 and 6.";
        }

        if (!isValidS3Bucket(s3Bucket)) {
            validationErrors.s3Bucket = "Invalid S3 Bucket.";
        }

        if (!isValidPathOutput(pathOutput)) {
            validationErrors.pathOutput = "Invalid Path Output.";
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const config = {
            dtHdId,
            startDate,
            endDate,
            compNum,
            s3Bucket,
            pathOutput,
            textureSize,
            pageCount,
            imagesIntervalForTexturing,
            voxelSize,
            decimateMesh,
            clusterThreshold,
            makeYUp: makeYUp ? 1 : 0,
        };

        // Simulate saving config
        setFinalConfig(config);


    };

    return (
        <div>
            <h1>Slack View Form</h1>
            <div>
                <label>
                    dtHdId:
                    <input type="text" value={dtHdId} onChange={(e) => setDtHdId(e.target.value)}/>
                    {errors.dtHdId && <span style={{color: 'red'}}>{errors.dtHdId}</span>}
                </label>
            </div>
            <div>
                <label>
                    Start Date:
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
                    {errors.startDate && <span style={{color: 'red'}}>{errors.startDate}</span>}
                </label>
            </div>
            <div>
                <label>
                    End Date:
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
                    {errors.endDate && <span style={{color: 'red'}}>{errors.endDate}</span>}
                </label>
            </div>
            <div>
                <label>
                    Number of Computation Machines:
                    <input type="number" value={compNum} onChange={(e) => setCompNum(e.target.value)}/>
                    {errors.compNum && <span style={{color: 'red'}}>{errors.compNum}</span>}
                </label>
            </div>
            <div>
                <label>
                    S3 Bucket:
                    <input type="text" value={s3Bucket} onChange={(e) => setS3Bucket(e.target.value)}/>
                    {errors.s3Bucket && <span style={{color: 'red'}}>{errors.s3Bucket}</span>}
                </label>
            </div>
            <div>
                <label>
                    Path Output:
                    <input type="text" value={pathOutput} onChange={(e) => setPathOutput(e.target.value)}/>
                    {errors.pathOutput && <span style={{color: 'red'}}>{errors.pathOutput}</span>}
                </label>
            </div>
            <div>
                <label>
                    Texture Size:
                    <input type="number" value={textureSize} onChange={(e) => setTextureSize(e.target.value)}/>
                </label>
            </div>
            <div>
                <label>
                    Page Count:
                    <input type="number" value={pageCount} onChange={(e) => setPageCount(e.target.value)}/>
                </label>
            </div>
            <div>
                <label>
                    Images Interval for Texturing:
                    <input type="number" value={imagesIntervalForTexturing}
                           onChange={(e) => setImagesIntervalForTexturing(e.target.value)}/>
                </label>
            </div>
            <div>
                <label>
                    Voxel Size:
                    <input type="number" value={voxelSize} onChange={(e) => setVoxelSize(e.target.value)}/>
                </label>
            </div>
            <div>
                <label>
                    Decimate Mesh:
                    <input type="number" value={decimateMesh} onChange={(e) => setDecimateMesh(e.target.value)}/>
                </label>
            </div>
            <div>
                <label>
                    Cluster Threshold:
                    <input type="number" value={clusterThreshold}
                           onChange={(e) => setClusterThreshold(e.target.value)}/>
                </label>
            </div>
            <div>
                <label>
                    Make Y Up:
                    <input type="checkbox" checked={makeYUp} onChange={(e) => setMakeYUp(e.target.checked)}/>
                </label>
            </div>
            <button onClick={handleSubmit}>Submit</button>

            {finalConfig && (
                <div>
                    <h2>Final Config</h2>
                    <pre>{JSON.stringify(finalConfig, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default ElementViewForm;
