"""백소정 판교점 초기 데이터 시드 스크립트 - 앱 첫 구동 시 실행"""
import httpx
from pathlib import Path
from sqlalchemy import select
from app.database import async_session
from app.models import Store, Admin, Category, Menu, Table
from app.services.auth_service import hash_password
from app.config import settings

STORE_NAME = "백소정 판교점"
STORE_SLUG = "baeksojeong-pangyo"
ADMIN_USER = "admin"
ADMIN_PASS = "admin1234"

CATEGORIES = ["돈카츠", "소바/우동", "덮밥", "세트메뉴", "사이드/음료"]

MENUS = [
    # 돈카츠
    {"name": "로스카츠", "price": 13900, "cat": "돈카츠", "desc": "등심 부위를 바삭하게 튀겨낸 정통 로스카츠", "img_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600"},
    {"name": "히레카츠", "price": 14900, "cat": "돈카츠", "desc": "안심 부위의 부드럽고 담백한 히레카츠", "img_url": "https://images.unsplash.com/photo-1554502078-ef0fc409efce?w=600"},
    {"name": "치즈카츠", "price": 14900, "cat": "돈카츠", "desc": "고소한 치즈가 가득한 치즈 돈카츠", "img_url": "https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=600"},
    {"name": "모듬카츠", "price": 16900, "cat": "돈카츠", "desc": "로스카츠와 히레카츠를 한번에 즐기는 모듬", "img_url": "https://images.unsplash.com/photo-1613454320437-0c228c8b1723?w=600"},
    {"name": "새우카츠", "price": 15900, "cat": "돈카츠", "desc": "탱글한 왕새우를 바삭하게 튀긴 새우카츠", "img_url": "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600"},
    # 소바/우동
    {"name": "판모밀", "price": 10900, "cat": "소바/우동", "desc": "시원한 쯔유에 즐기는 메밀 소바", "img_url": "https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=600"},
    {"name": "마제소바", "price": 11900, "cat": "소바/우동", "desc": "특제 소스에 비벼 먹는 마제소바", "img_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600"},
    {"name": "카라이 마제소바", "price": 12900, "cat": "소바/우동", "desc": "매콤한 양념의 마제소바", "img_url": "https://images.unsplash.com/photo-1552611052-33e04de1b100?w=600"},
    {"name": "온소바", "price": 10900, "cat": "소바/우동", "desc": "따뜻한 국물의 메밀 소바", "img_url": "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600"},
    {"name": "가케우동", "price": 9900, "cat": "소바/우동", "desc": "담백한 국물의 정통 우동", "img_url": "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=600"},
    # 덮밥
    {"name": "가츠동", "price": 11900, "cat": "덮밥", "desc": "바삭한 돈카츠를 계란으로 감싼 가츠동", "img_url": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600"},
    {"name": "사케동", "price": 13900, "cat": "덮밥", "desc": "신선한 연어를 올린 사케동", "img_url": "https://images.unsplash.com/photo-1534256958597-7fe685cbd745?w=600"},
    {"name": "규동", "price": 10900, "cat": "덮밥", "desc": "달콤한 간장 소스의 소고기 덮밥", "img_url": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600"},
    # 세트메뉴
    {"name": "로스카츠+판모밀 세트", "price": 16900, "cat": "세트메뉴", "desc": "로스카츠와 판모밀을 함께 즐기는 세트", "img_url": "https://images.unsplash.com/photo-1580959375944-abd7e991f971?w=600"},
    {"name": "히레카츠+판모밀 세트", "price": 17900, "cat": "세트메뉴", "desc": "히레카츠와 판모밀을 함께 즐기는 세트", "img_url": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600"},
    {"name": "가츠동+판모밀 세트", "price": 14900, "cat": "세트메뉴", "desc": "가츠동과 판모밀을 함께 즐기는 세트", "img_url": "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600"},
    # 사이드/음료
    {"name": "미니우동", "price": 3500, "cat": "사이드/음료", "desc": "사이드로 즐기는 미니 우동", "img_url": "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=600"},
    {"name": "교자만두", "price": 5900, "cat": "사이드/음료", "desc": "바삭하게 구워낸 교자 만두", "img_url": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600"},
    {"name": "생맥주", "price": 5000, "cat": "사이드/음료", "desc": "시원한 생맥주 한 잔", "img_url": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600"},
    {"name": "콜라/사이다", "price": 2000, "cat": "사이드/음료", "desc": "코카콜라 / 칠성사이다", "img_url": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600"},
]

TABLES = [
    {"number": 1, "password": "1234"},
    {"number": 2, "password": "1234"},
    {"number": 3, "password": "1234"},
    {"number": 4, "password": "1234"},
    {"number": 5, "password": "1234"},
]


async def download_image(url: str, filename: str) -> str | None:
    upload_dir = Path(settings.UPLOAD_DIR) / "seed"
    upload_dir.mkdir(parents=True, exist_ok=True)
    filepath = upload_dir / filename
    if filepath.exists():
        return f"/uploads/seed/{filename}"
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                filepath.write_bytes(resp.content)
                return f"/uploads/seed/{filename}"
    except Exception as e:
        print(f"[seed] Image download failed ({filename}): {e}")
    return None


async def seed_baeksojeong():
    """백소정 판교점 초기 데이터 등록 (이미 존재하면 스킵)"""
    async with async_session() as session:
        result = await session.execute(select(Store).where(Store.slug == STORE_SLUG))
        if result.scalar_one_or_none():
            print(f"[seed] '{STORE_NAME}' already exists. Skipping.")
            return

        store = Store(name=STORE_NAME, slug=STORE_SLUG, address="경기 성남시 분당구 판교역로 240 109호", phone="010-0000-0000")
        session.add(store)
        await session.flush()

        admin = Admin(store_id=store.id, username=ADMIN_USER, password_hash=hash_password(ADMIN_PASS))
        session.add(admin)

        cat_map = {}
        for i, name in enumerate(CATEGORIES):
            cat = Category(store_id=store.id, name=name, sort_order=i)
            session.add(cat)
            await session.flush()
            cat_map[name] = cat.id

        for i, m in enumerate(MENUS):
            safe_name = m["name"].replace(" ", "_").replace("/", "_").replace("+", "_")
            filename = f"bsj_{safe_name}.jpg"
            image_url = await download_image(m["img_url"], filename)
            menu = Menu(
                store_id=store.id,
                category_id=cat_map[m["cat"]],
                name=m["name"],
                price=m["price"],
                description=m["desc"],
                image_url=image_url,
                sort_order=i,
            )
            session.add(menu)

        for t in TABLES:
            table = Table(store_id=store.id, table_number=t["number"], password=t["password"])
            session.add(table)

        await session.commit()
        print(f"[seed] '{STORE_NAME}' seeded: {len(MENUS)} menus, {len(TABLES)} tables")
