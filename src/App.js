import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import numWords from 'num-words'; // Import numWords library

function App() {
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [textNumerals, setTextNumerals] = useState('');
  const [unit, setUnit] = useState('');
  const [qrScanning, setQrScanning] = useState(false);
  const [error, setError] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [qrData, setQrData] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("https://api-staging.inveesync.in/test/get-items");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleItemChange = (e) => {
    const selectedItem = items.find(item => item.id == e.target.value);
    setSelectedItem(selectedItem);
    setUnit(selectedItem.unit);
  };

  const handleQuantityChange = (e) => {
    const quantityValue = parseInt(e.target.value);
    setQuantity(quantityValue);
    setTextNumerals(convertToTextNumerals(quantityValue));
  };

  const handleScanLocation = () => {
    if (!selectedItem) {
      setError("Please select an item first.");
      return;
    }

    setQrScanning(true);
  };

  const handleQrScan = (data) => {
    if (data) {
      setQrScanning(false);
      setDestinationLocation(data);
    }
  };

  const handleDestinationLocationChange = (e) => {
    setDestinationLocation(e.target.value);
  };

  const handleSubmit = async () => {
    if (!selectedItem) {
      setError("Please select an item first.");
      return;
    }

    if (!destinationLocation) {
      setError("Please enter a destination location.");
      return;
    }

    if (!selectedItem.allowed_locations.includes(destinationLocation)) {
      setError("The destination location is not allowed for this item. Please try again.");
      return;
    }

    try {
      const response = await fetch("https://api-staging.inveesync.in/test/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          item_id: selectedItem.id,
          location: destinationLocation
        })
      });
      if (response.ok) {
        setQrData(JSON.stringify({ selectedItem, location: destinationLocation })); // Set QR data with the updated location
        setQrScanning(true); // Enable QR scanning
      } else {
        setError("Failed to submit the location. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting location:", error);
      setError("Failed to submit the location. Please try again.");
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  const convertToTextNumerals = (quantity) => {
    return numWords(quantity); // Using numWords library to convert number to text
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="max-w-md w-full bg-white p-6 rounded-md shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Inventory Location System</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="mb-4">
          <label htmlFor="item" className="block">Select Item:</label>
          <select id="item" onChange={handleItemChange} className="block w-full border border-gray-300 rounded px-3 py-2">
            <option value="">Select an item...</option>
            {items.map(item => (
              <option key={item.id} value={item.id}>{item.item_name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="quantity" className="block">Quantity:</label>
          <input type="number" id="quantity" value={quantity} onChange={handleQuantityChange} className="w-full border border-gray-300 rounded px-3 py-2" />
        </div>
        <div id="textNumerals" className="mb-4">Text Numerals: {textNumerals}</div>
        <div className="mb-4">
          <label htmlFor="unit" className="block">Unit:</label>
          <input type="text" id="unit" value={unit} readOnly className="w-full border border-gray-300 rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label htmlFor="destinationLocation" className="block">Destination Location:</label>
          <input type="text" id="destinationLocation" value={destinationLocation} onChange={handleDestinationLocationChange} className="w-full border border-gray-300 rounded px-3 py-2" />
        </div>
        <button onClick={handleSubmit} className="block w-full bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600">Submit and scan the final location</button>
        {qrData && (
          <div className="mt-4">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}`} alt="QR Code" />
          </div>
        )}
        <button onClick={handleScanLocation} className="block w-full bg-blue-500 text-white rounded mt-4 px-4 py-2 hover:bg-blue-600">Scan Initial Location</button>
        {qrScanning && (
          <QrReader
            delay={300}
            onError={handleError}
            onScan={handleQrScan}
            style={{ width: '100%' }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
