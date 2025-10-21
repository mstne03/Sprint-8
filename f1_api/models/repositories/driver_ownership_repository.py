from sqlmodel import Session, select
from f1_api.models.app_models import DriverOwnership

class DriverOwnershipRepository:
    def __init__(self, session: Session):
        self.session = session
    
    def get_by_driver_and_league(self, driver_id: int, league_id: int) -> DriverOwnership | None:
        """Obtiene la propiedad de un piloto en una liga específica."""
        return self.session.exec(
            select(DriverOwnership).where(
                DriverOwnership.driver_id == driver_id,
                DriverOwnership.league_id == league_id
            )
        ).first()
    
    def get_all_by_league(self, league_id: int) -> list[DriverOwnership]:
        """Obtiene todas las propiedades de pilotos en una liga."""
        return self.session.exec(
            select(DriverOwnership).where(
                DriverOwnership.league_id == league_id
            )
        ).all()
    
    def get_owned_by_user_in_league(self, user_id: int, league_id: int) -> list[DriverOwnership]:
        """Obtiene todos los pilotos que posee un usuario en una liga."""
        return self.session.exec(
            select(DriverOwnership).where(
                DriverOwnership.owner_id == user_id,
                DriverOwnership.league_id == league_id
            )
        ).all()
    
    def get_free_drivers_in_league(self, league_id: int) -> list[DriverOwnership]:
        """Obtiene todos los pilotos libres (sin dueño) en una liga."""
        return self.session.exec(
            select(DriverOwnership).where(
                DriverOwnership.league_id == league_id,
                DriverOwnership.owner_id == None
            )
        ).all()
    
    def get_drivers_for_sale_in_league(self, league_id: int) -> list[DriverOwnership]:
        """Obtiene todos los pilotos en venta en una liga."""
        return self.session.exec(
            select(DriverOwnership).where(
                DriverOwnership.league_id == league_id,
                DriverOwnership.is_listed_for_sale == True
            )
        ).all()
    
    def create(self, ownership: DriverOwnership) -> DriverOwnership:
        """Crea un nuevo registro de propiedad."""
        self.session.add(ownership)
        return ownership
    
    def update(self, ownership: DriverOwnership) -> DriverOwnership:
        """Actualiza un registro de propiedad existente."""
        self.session.add(ownership)
        return ownership
    
    def delete(self, ownership: DriverOwnership):
        """Elimina un registro de propiedad."""
        self.session.delete(ownership)
