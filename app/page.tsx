'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Utensils, Plus, Sparkles, MapPin, UserCheck, LogOut, Pencil, Trash2, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FoodItem {
  id: string;
  name: string;
  address: string;
  category: 'sang' | 'trua' | 'toi' | 'vat';
  uniqueKey?: string;
}

const CATEGORIES = [
  { id: 'sang', label: '☀️ Ăn Sáng', color: 'from-amber-400 to-orange-500' },
  { id: 'trua', label: '🌤️ Ăn Trưa', color: 'from-emerald-400 to-teal-600' },
  { id: 'toi', label: '🌙 Ăn Tối', color: 'from-indigo-500 to-purple-600' },
  { id: 'vat', label: '🧋 Ăn Vặt', color: 'from-pink-400 to-rose-500' },
] as const;

export default function Home() {
  const [username, setUsername] = useState('');
  const [activeCategory, setActiveCategory] = useState<'sang' | 'trua' | 'toi' | 'vat'>('sang');
  
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [foodName, setFoodName] = useState('');
  const [address, setAddress] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  
  const [rouletteItems, setRouletteItems] = useState<FoodItem[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [translateX, setTranslateX] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('app_user');
    if (!savedUser) {
      router.push('/login');
    } else {
      setUsername(savedUser);
      loadFoods(savedUser);
    }
  }, [router]);

  const loadFoods = async (user: string) => {
    try {
      const res = await fetch(`/api/foods?username=${user}`);
      const data = await res.json();
      if (data.foods && data.foods.length > 0) {
        setFoods(data.foods);
        localStorage.setItem(`foods_${user}`, JSON.stringify(data.foods));
      } else {
        const localFoods = localStorage.getItem(`foods_${user}`);
        if (localFoods) setFoods(JSON.parse(localFoods));
      }
    } catch (e) {
      const localFoods = localStorage.getItem(`foods_${user}`);
      if (localFoods) setFoods(JSON.parse(localFoods));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('app_user');
    router.push('/login');
  };

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    const newFood: FoodItem = {
      id: Date.now().toString(),
      name: foodName.trim(),
      address: address.trim() || 'Chưa có địa chỉ',
      category: activeCategory
    };
    
    const updatedFoods = [...foods, newFood];
    setFoods(updatedFoods);
    localStorage.setItem(`foods_${username}`, JSON.stringify(updatedFoods));
    
    setFoodName('');
    setAddress('');

    try {
      await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          foodName,
          address,
          category: activeCategory,
        }),
      });
    } catch (e) {}
  };

  const startEdit = (item: FoodItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditAddress(item.address);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditAddress('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;

    const updatedFoods = foods.map((f) =>
      f.id === id ? { ...f, name: editName.trim(), address: editAddress.trim() || 'Chưa có địa chỉ' } : f
    );

    setFoods(updatedFoods);
    localStorage.setItem(`foods_${username}`, JSON.stringify(updatedFoods));
    cancelEdit();

    try {
      await fetch('/api/foods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          foodId: id,
          foodName: editName,
          address: editAddress,
        }),
      });
    } catch (e) {}
  };

  const handleDeleteFood = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa món ăn này?')) return;

    const updatedFoods = foods.filter((f) => f.id !== id);
    setFoods(updatedFoods);
    localStorage.setItem(`foods_${username}`, JSON.stringify(updatedFoods));

    try {
      await fetch(`/api/foods?username=${username}&foodId=${id}`, {
        method: 'DELETE',
      });
    } catch (e) {}
  };

  const currentCategoryFoods = foods.filter((f) => f.category === activeCategory);

  const spinCSGO = () => {
    if (currentCategoryFoods.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setSelectedFood(null);

    const items: FoodItem[] = [];
    for (let i = 0; i < 50; i++) {
      const randomItem = currentCategoryFoods[Math.floor(Math.random() * currentCategoryFoods.length)];
      items.push({ ...randomItem, uniqueKey: `${i}-${randomItem.id}` });
    }
    
    const targetWinner = items[42];
    setRouletteItems(items);

    const cardWidth = 172; 
    const targetOffset = -(42 * cardWidth) + (300 / 2 - 80); 

    setTranslateX(0);

    setTimeout(() => {
      setTranslateX(targetOffset);
    }, 50);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedFood(targetWinner);
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    }, 5500);
  };

  if (!username) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8 font-sans">
      <header className="w-full max-w-2xl flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Utensils className="w-7 h-7 text-orange-500" />
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            Hôm Nay Ăn Gì?
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full text-sm border border-slate-700">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">{username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Đăng xuất
          </button>
        </div>
      </header>

      <div className="w-full max-w-2xl space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setSelectedFood(null);
                setRouletteItems([]);
                cancelEdit();
              }}
              className={`py-3 px-4 rounded-xl font-medium transition-all text-sm md:text-base ${
                activeCategory === cat.id
                  ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105 font-bold`
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden text-center shadow-2xl">
          <h3 className="text-slate-400 text-sm font-medium mb-4 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-400" /> VÒNG QUAY MỞ HÒM FOODS
          </h3>

          <div className="relative w-full h-36 bg-slate-950 rounded-xl overflow-hidden border-2 border-slate-800 my-4 flex items-center">
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-amber-400 z-20 shadow-[0_0_15px_#f59e0b] -translate-x-1/2"></div>
            
            <motion.div
              className="flex gap-3 absolute left-0 px-4"
              animate={{ x: translateX }}
              transition={
                isSpinning
                  ? { duration: 5.5, ease: [0.15, 0.85, 0.35, 1.0] }
                  : { duration: 0 }
              }
            >
              {rouletteItems.length > 0 ? (
                rouletteItems.map((item) => (
                  <div
                    key={item.uniqueKey}
                    className="w-40 h-28 bg-slate-800 border border-slate-700 rounded-lg flex-shrink-0 flex flex-col justify-center items-center p-2 text-center shadow-md"
                  >
                    <span className="font-bold text-slate-100 text-sm line-clamp-1">{item.name}</span>
                    <span className="text-xs text-slate-400 line-clamp-1 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-400" /> {item.address}
                    </span>
                  </div>
                ))
              ) : (
                <div className="w-full text-slate-500 text-sm italic py-8 text-center">
                  {currentCategoryFoods.length > 0
                    ? 'Bấm nút bên dưới để bắt đầu quay!'
                    : 'Chưa có món ăn. Hãy thêm vài món ở khung dưới!'}
                </div>
              )}
            </motion.div>
          </div>

          {selectedFood && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="my-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
            >
              <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">Món Ăn Nhận Được</div>
              <div className="text-2xl font-black text-amber-300">{selectedFood.name}</div>
              <div className="text-sm text-slate-300 mt-1 flex items-center justify-center gap-1">
                <MapPin className="w-4 h-4 text-orange-400" /> {selectedFood.address}
              </div>
            </motion.div>
          )}

          <button
            onClick={spinCSGO}
            disabled={isSpinning || currentCategoryFoods.length === 0}
            className="mt-2 w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-slate-950 font-black rounded-xl hover:brightness-110 disabled:opacity-50 transition-all uppercase tracking-wider shadow-lg shadow-orange-500/20"
          >
            {isSpinning ? 'Đang Mở Hòm...' : 'MỞ HÒM RANDOM'}
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-orange-500" /> Thêm Món Vào Kho ({CATEGORIES.find((c) => c.id === activeCategory)?.label})
          </h3>
          <form onSubmit={handleAddFood} className="space-y-3">
            <input
              type="text"
              placeholder="Tên món ăn (Ví dụ: Bún bò, Trà sữa,...)..."
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              required
            />
            <input
              type="text"
              placeholder="Địa chỉ quán (Ví dụ: 123 Nguyễn Huệ)..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-all"
            >
              Lưu Món Ăn
            </button>
          </form>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-slate-400 mb-3">
            Danh Sách Món Đã Thêm ({currentCategoryFoods.length})
          </h3>
          {currentCategoryFoods.length === 0 ? (
            <p className="text-xs text-slate-500">Chưa có món ăn nào trong mục này.</p>
          ) : (
            <div className="space-y-2">
              {currentCategoryFoods.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-800/50 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-sm"
                >
                  {editingId === item.id ? (
                    <div className="flex-1 flex flex-col md:flex-row gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-orange-500/50 rounded-lg text-sm text-white focus:outline-none"
                        placeholder="Tên món ăn"
                      />
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-orange-500/50 rounded-lg text-sm text-white focus:outline-none"
                        placeholder="Địa chỉ quán"
                      />
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-all"
                          title="Lưu"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all"
                          title="Hủy"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="font-semibold text-slate-200">{item.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-orange-400" /> {item.address}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-all"
                          title="Sửa món"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFood(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
                          title="Xóa món"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}