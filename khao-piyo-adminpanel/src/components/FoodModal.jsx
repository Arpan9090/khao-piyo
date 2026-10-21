import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { addFood } from '../services/api';
import { toast } from 'react-toastify';

// Predefined categories list with emojis
export const categories = [
  { name: 'Biryani', emoji: '🍛' },
  { name: 'Pizza', emoji: '🍕' },
  { name: 'Burger', emoji: '🍔' },
  { name: 'North Indian', emoji: '🍲' },
  { name: 'South Indian', emoji: '🥘' },
  { name: 'Dosa', emoji: '🫓' },
  { name: 'Thali', emoji: '🍱' },
  { name: 'Chinese', emoji: '🥡' },
  { name: 'Noodles', emoji: '🍜' },
  { name: 'Momos', emoji: '🥟' },
  { name: 'Rolls', emoji: '🌯' },
  { name: 'Sandwich', emoji: '🥪' },
  { name: 'Pav Bhaji', emoji: '🍞' },
  { name: 'Chole Bhature', emoji: '🥙' },
  { name: 'Paratha', emoji: '🫔' },
  { name: 'Pasta', emoji: '🍝' },
  { name: 'Salad', emoji: '🥗' },
  { name: 'Desserts', emoji: '🍮' },
  { name: 'Cakes', emoji: '🍰' },
  { name: 'Ice Cream', emoji: '🍨' },
  { name: 'Shakes', emoji: '🥤' },
  { name: 'Beverages', emoji: '☕' },
];

export default function FoodModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please upload a food image file.');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('food', JSON.stringify(formData));
      data.append('file', file);

      await addFood(data);
      toast.success('Food item added successfully!');

      setFormData({ name: '', description: '', price: '', category: '' });
      setFile(null);
      
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add food item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold">Add New Food Item</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Food Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-orange-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="" disabled>Select category</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              rows="3"
              required
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-orange-500 outline-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Food Image</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 cursor-pointer hover:border-orange-500 transition">
              <Upload size={24} className="text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">{file ? file.name : 'Click to upload image'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-lg shadow-orange-500/30 transition disabled:opacity-50">
              {loading ? 'Saving...' : 'Add Food'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}