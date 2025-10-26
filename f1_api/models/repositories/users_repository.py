from sqlmodel import select, Session, col
from f1_api.models.app_models import UserCreate, Users


class UserRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_existing_user(self, user:UserCreate):
        """Check if user exists"""
        return self.session.exec(
            select(Users).where(
                (Users.user_name == user.user_name) |
                (Users.email == user.email) |
                (Users.supabase_user_id == user.supabase_user_id)
            )
        ).first()
    
    def check_user_by_id(self, user_id: str):
        """Chekc if user existis using supabase id"""
        return self.session.exec(
            select(Users).where(Users.supabase_user_id == user_id)
        ).first()
    
    def create_user(self, user: UserCreate):
        """Create and persist user"""
        new_user = Users(
            user_name=user.user_name,
            email=user.email,
            supabase_user_id=user.supabase_user_id,
            is_verified=True
        )
        self.session.add(new_user)
        self.session.commit()
        self.session.refresh(new_user)
        return new_user
    
    def get_users_names_by_ids(self, user_ids: list[int]) -> dict[int, str]:
        """
        Get a mapping of user_id -> user_name for a list of user IDs.
        
        Args:
            user_ids: List of internal user IDs
        
        Returns:
            dict mapping user IDs to user names
        """
        if not user_ids:
            return {}
        
        users_list = self.session.exec(
            select(Users).where(col(Users.id).in_(user_ids))
        ).all()
        
        return {u.id: u.user_name for u in users_list}
