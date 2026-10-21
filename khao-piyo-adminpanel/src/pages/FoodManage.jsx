import { useEffect, useState } from 'react';
import { Plus, Trash2, Utensils } from 'lucide-react';
import { getFoods, deleteFood } from '../services/api';
import FoodModal from '../components/FoodModal';
import { toast } from 'react-toastify';

export default function FoodManage() {
  const [foods, setFoods] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFoods = async () => {
    try {
      const res = await getFoods();
      setFoods(res.data);
    } catch {
      toast.error('Failed to fetch food items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    try {
      await deleteFood(id);
      toast.success('Food item deleted successfully!');
      setFoods(foods.filter(f => f.id !== id));
    } catch (error) {
      toast.error(error.response?.data || 'Failed to delete food item.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Food Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add, view, and delete menu items for Khao-Piyo.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl shadow-lg shadow-orange-500/30 transition"
        >
          <Plus size={20} /> Add Food
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-400">Loading food items...</td></tr>
              ) : foods.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-gray-400">No food items found.</td></tr>
              ) : (
                foods.map((food) => (
                  <tr key={food.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition">
                    <td className="p-4">
                      <img src={food.imageUrl} alt={food.name} className="w-12 h-12 object-cover rounded-xl border border-gray-200 dark:border-gray-700" />
                    </td>
                    <td className="p-4 font-semibold">{food.name}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-full">
                        {food.category}
                      </span>
                    </td>
                    <td className="p-4 font-medium">₹{food.price}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(food.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
                        title="Delete Item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FoodModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchFoods} />
    </div>
  );
}