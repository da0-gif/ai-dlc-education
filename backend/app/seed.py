"""베이징스토리 판교 초기 데이터 시드 스크립트 - 앱 첫 구동 시 실행"""
import os
import uuid
import httpx
from pathlib import Path
from sqlalchemy import select
from app.database import async_session
from app.models import Store, Admin, Category, Menu, Table
from app.services.auth_service import hash_password
from app.config import settings

STORE_NAME = "베이징스토리 판교"
STORE_SLUG = "beijing-story"
ADMIN_USER = "admin"
ADMIN_PASS = "admin1234"

CATEGORIES = ["면류", "밥류", "요리", "코스", "사이드/음료"]

MENUS = [
    # 면류
    {"name": "자장면", "price": 9000, "cat": "면류", "desc": "정통 춘장으로 볶아낸 베이징스토리 시그니처 자장면", "img_url": "https://images.unsplash.com/photo-1645696996834-61b14a370e04?w=600"},
    {"name": "짬뽕", "price": 10000, "cat": "면류", "desc": "해물이 풍성한 얼큰한 짬뽕", "img_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600"},
    {"name": "굴짬뽕", "price": 12000, "cat": "면류", "desc": "통통한 굴이 가득 들어간 프리미엄 짬뽕", "img_url": "https://images.unsplash.com/photo-1555126634-323283e090fa?w=600"},
    {"name": "쟁반짜장", "price": 13000, "cat": "면류", "desc": "쫄깃한 면발에 풍성한 토핑의 쟁반짜장", "img_url": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600"},
    {"name": "쭈꾸미짜장면", "price": 12000, "cat": "면류", "desc": "매콤한 쭈꾸미와 자장의 조화", "img_url": "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600"},
    # 밥류
    {"name": "베이징볶음밥", "price": 10000, "cat": "밥류", "desc": "마늘쫑이 들어간 이색 볶음밥", "img_url": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600"},
    {"name": "새우볶음밥", "price": 11000, "cat": "밥류", "desc": "탱글한 새우가 가득한 볶음밥", "img_url": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600"},
    {"name": "잡채밥", "price": 10000, "cat": "밥류", "desc": "다양한 채소와 당면이 어우러진 잡채밥", "img_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600"},
    # 요리
    {"name": "탕수육", "price": 29000, "cat": "요리", "desc": "바삭한 튀김옷에 새콤달콤 소스의 탕수육", "img_url": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600"},
    {"name": "칠리새우", "price": 32000, "cat": "요리", "desc": "매콤달콤한 소스에 버무린 바삭한 새우", "img_url": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600"},
    {"name": "깐쇼새우", "price": 30000, "cat": "요리", "desc": "바삭한 튀김옷과 특제 소스의 깐쇼새우", "img_url": "https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=600"},
    {"name": "마파두부", "price": 18000, "cat": "요리", "desc": "얼얼한 사천식 마파두부", "img_url": "https://images.unsplash.com/photo-1582452919408-aca4a5e5e0b2?w=600"},
    {"name": "고추잡채", "price": 22000, "cat": "요리", "desc": "아삭한 채소와 고기의 불맛 잡채", "img_url": "https://images.unsplash.com/photo-1512058454905-6b841e7ad132?w=600"},
    {"name": "유산슬", "price": 28000, "cat": "요리", "desc": "해물과 채소를 녹말 소스에 볶아낸 유산슬", "img_url": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600"},
    {"name": "양장피", "price": 30000, "cat": "요리", "desc": "신선한 재료에 겨자 소스를 곁들인 양장피", "img_url": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600"},
    # 코스
    {"name": "만 [萬] 코스", "price": 39000, "cat": "코스", "desc": "1인 39,000원 | 전채~후식까지 풀코스 (2인 이상)", "img_url": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600"},
    {"name": "사 [事] 코스", "price": 55000, "cat": "코스", "desc": "1인 55,000원 | 프리미엄 코스 (4인 이상)", "img_url": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600"},
    # 사이드/음료
    {"name": "군만두", "price": 8000, "cat": "사이드/음료", "desc": "바삭하게 구워낸 수제 군만두", "img_url": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600"},
    {"name": "옥수수빠스", "price": 12000, "cat": "사이드/음료", "desc": "달콤 바삭한 옥수수 튀김", "img_url": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600"},
    {"name": "칭따오 맥주", "price": 6000, "cat": "사이드/음료", "desc": "중식에 어울리는 시원한 칭따오", "img_url": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600"},
    {"name": "콜라/사이다", "price": 3000, "cat": "사이드/음료", "desc": "코카콜라 / 칠성사이다", "img_url": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600"},
]

TABLES = [
    {"number": 1, "password": "1234"},
    {"number": 2, "password": "1234"},
    {"number": 3, "password": "1234"},
    {"number": 4, "password": "1234"},
    {"number": 5, "password": "1234"},
]


async def download_image(url: str, filename: str) -> str | None:
    """이미지를 다운로드하여 uploads/ 디렉토리에 저장"""
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


async def seed_beijing_story():
    """베이징스토리 판교 초기 데이터 등록 (이미 존재하면 스킵)"""
    async with async_session() as session:
        # 이미 존재하면 스킵
        result = await session.execute(select(Store).where(Store.slug == STORE_SLUG))
        if result.scalar_one_or_none():
            print(f"[seed] '{STORE_NAME}' already exists. Skipping.")
            return

        # Store
        store = Store(name=STORE_NAME, slug=STORE_SLUG, address="경기 성남시 분당구 판교역로 230", phone="0507-1438-0802")
        session.add(store)
        await session.flush()

        # Admin
        admin = Admin(store_id=store.id, username=ADMIN_USER, password_hash=hash_password(ADMIN_PASS))
        session.add(admin)

        # Categories
        cat_map = {}
        for i, name in enumerate(CATEGORIES):
            cat = Category(store_id=store.id, name=name, sort_order=i)
            session.add(cat)
            await session.flush()
            cat_map[name] = cat.id

        # Menus (이미지 다운로드 포함)
        for i, m in enumerate(MENUS):
            safe_name = m["name"].replace(" ", "_").replace("/", "_")
            filename = f"{safe_name}.jpg"
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

        # Tables
        for t in TABLES:
            table = Table(store_id=store.id, table_number=t["number"], password=t["password"])
            session.add(table)

        await session.commit()
        print(f"[seed] '{STORE_NAME}' seeded: {len(MENUS)} menus, {len(TABLES)} tables")
