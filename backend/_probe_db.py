import traceback
from database import SessionLocal
from models import User

print('--- Step 1: hash_password ---')
pwd = 'Password123!'
hashed = None
try:
    from utils.auth import hash_password
    hashed = hash_password(pwd)
    print('Input password:', pwd)
    print('Hashed password:', hashed)
except Exception:
    print('hash_password failed. Traceback:')
    print(traceback.format_exc())
    hashed = 'HASH_FAILED_FALLBACK'

print('\n--- Step 2: query first user ---')
db = None
try:
    db = SessionLocal()
    user = db.query(User).first()
    if user is None:
        print('First user: None')
    else:
        print('First user found:', {'id': getattr(user, 'id', None), 'email': getattr(user, 'email', None), 'full_name': getattr(user, 'full_name', None)})
except Exception:
    print('Query first user failed. Traceback:')
    print(traceback.format_exc())
finally:
    if db is not None:
        db.close()

print('\n--- Step 3: create probe user and commit ---')
db = None
try:
    db = SessionLocal()
    probe = User(email='probe_x@example.com', full_name='Probe X', hashed_password=hashed, face_encoding=None)
    db.add(probe)
    db.commit()
    db.refresh(probe)
    print('Probe user created:', {'id': getattr(probe, 'id', None), 'email': getattr(probe, 'email', None)})
except Exception:
    if db is not None:
        db.rollback()
    print('Create/commit failed. Traceback:')
    print(traceback.format_exc())
finally:
    if db is not None:
        db.close()
