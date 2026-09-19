import { useState, useEffect } from 'react';

const PeriodModal = ({ isOpen, onClose, onSave }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      setEndDate(today);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert('End date cannot be before start date');
      return;
    }

    try {
      await onSave(startDate, endDate);
      onClose();
    } catch (error) {
      console.error('Error saving period:', error);
      alert('Failed to save period. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-[#fff5f5] rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Add Period Entry
            </h2>
            <button
              onClick={onClose}
              type="button"
              className="text-gray-400 hover:text-gray-600 text-2xl sm:text-3xl leading-none"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-blue-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-blue-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm sm:text-base"
                required
              />
            </div>

            <div className="flex gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl sm:rounded-2xl font-semibold hover:bg-gray-50 transition-all text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-500 text-[#fff5f5] rounded-xl sm:rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
              >
                Save Period
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PeriodModal;
