import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export interface FoodItem {
  id: string;
  name: string;
  address: string;
  category: 'sang' | 'trua' | 'toi' | 'vat';
}

// 1. API ĐĂNG NHẬP / LẤY MÓN ĂN
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.toLowerCase().trim();
  const password = searchParams.get('password');

  if (!username) {
    return NextResponse.json({ error: 'Chưa nhập tên tài khoản' }, { status: 400 });
  }

  try {
    const userKey = `user_account:${username}`;
    const storedPassword = await kv.get<string>(userKey);

    if (!storedPassword) {
      return NextResponse.json({ error: 'Tài khoản không tồn tại!' }, { status: 404 });
    }

    if (password && storedPassword !== password) {
      return NextResponse.json({ error: 'Mật khẩu không chính xác!' }, { status: 401 });
    }

    const foodKey = `user_foods:${username}`;
    const userFoods = (await kv.get<FoodItem[]>(foodKey)) || [];

    return NextResponse.json({ success: true, foods: userFoods });
  } catch (error) {
    return NextResponse.json({ success: true, foods: [] });
  }
}

// 2. API ĐĂNG KÝ TÀI KHOẢN MỚI
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, username, password, foodName, address, category } = body;

    const usernameClean = username?.toLowerCase().trim();

    // Xử lý action "register"
    if (action === 'register') {
      if (!usernameClean || !password) {
        return NextResponse.json({ error: 'Vui lòng điền đầy đủ tài khoản và mật khẩu' }, { status: 400 });
      }

      const userKey = `user_account:${usernameClean}`;
      const existingUser = await kv.get<string>(userKey);

      if (existingUser) {
        return NextResponse.json({ error: 'Tên tài khoản này đã tồn tại!' }, { status: 400 });
      }

      // Lưu mật khẩu tài khoản mới
      await kv.set(userKey, password);
      return NextResponse.json({ success: true, message: 'Đăng ký thành công!' });
    }

    // Xử lý thêm món ăn thông thường
    if (!usernameClean || !foodName) {
      return NextResponse.json({ error: 'Thiếu thông tin món ăn' }, { status: 400 });
    }

    const foodKey = `user_foods:${usernameClean}`;
    let currentFoods: FoodItem[] = [];
    try {
      currentFoods = (await kv.get<FoodItem[]>(foodKey)) || [];
    } catch (e) {}

    const newFood: FoodItem = {
      id: Date.now().toString(),
      name: foodName.trim(),
      address: address?.trim() || 'Chưa có địa chỉ',
      category: category || 'sang',
    };

    const updatedFoods = [...currentFoods, newFood];
    try {
      await kv.set(foodKey, updatedFoods);
    } catch (e) {}

    return NextResponse.json({ success: true, foods: updatedFoods, newFood });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

// 3. API SỬA MÓN ĂN
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { username, foodId, foodName, address } = body;

    const foodKey = `user_foods:${username?.toLowerCase().trim()}`;
    let currentFoods: FoodItem[] = [];
    try {
      currentFoods = (await kv.get<FoodItem[]>(foodKey)) || [];
    } catch (e) {}

    const updatedFoods = currentFoods.map((item) =>
      item.id === foodId
        ? { ...item, name: foodName.trim(), address: address?.trim() || 'Chưa có địa chỉ' }
        : item
    );

    try {
      await kv.set(foodKey, updatedFoods);
    } catch (e) {}

    return NextResponse.json({ success: true, foods: updatedFoods });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi cập nhật' }, { status: 500 });
  }
}

// 4. API XÓA MÓN ĂN
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username')?.toLowerCase().trim();
    const foodId = searchParams.get('foodId');

    const foodKey = `user_foods:${username}`;
    let currentFoods: FoodItem[] = [];
    try {
      currentFoods = (await kv.get<FoodItem[]>(foodKey)) || [];
    } catch (e) {}

    const updatedFoods = currentFoods.filter((item) => item.id !== foodId);

    try {
      await kv.set(foodKey, updatedFoods);
    } catch (e) {}

    return NextResponse.json({ success: true, foods: updatedFoods });
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi xóa món' }, { status: 500 });
  }
}