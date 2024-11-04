import React, { useState } from 'react';

interface CameraFeedProps {   // Define the props for the CameraFeed component
  cameraUrl: string;
  width?: string;
  height?: string;
  onCameraError: () => void;  // Callback when the camera feed fails
  onCameraSuccess: () => void;  // Callback when the camera feed loads successfully
}

const CameraFeed: React.FC<CameraFeedProps> = ({
  cameraUrl,
  width = '640px',  // Sets the size of the camera feed
  height = '480px',
  onCameraError,
  onCameraSuccess,
}) => {
  const [error, setError] = useState<boolean>(false);

  const handleError = () => {
    setError(true);  // Mark the feed as having an error
    onCameraError();  // Notify parent component about the error
  };

  const handleLoad = () => {
    setError(false);  // Mark feed as successfully loaded
    onCameraSuccess();  // Notify parent component about success
  };

  return ( // Render the camera feed
    <div>
      {error ? (
        <p>Failed to load camera feed</p>  // Want to display this message if the camera feed fails, not working as expected right now
      ) : (
        <img
          src={cameraUrl}
          alt="Camera Feed"
          width={width}
          height={height}
          onError={handleError}  // Handle feed failure
          onLoad={handleLoad}    // Handle successful feed load
        />
      )}
    </div>
  );
};

export default CameraFeed;
