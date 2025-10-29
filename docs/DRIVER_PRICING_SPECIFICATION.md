# Especificación de Precios de Drivers - Sistema de Mercado

## 📋 Resumen del Problema Detectado

**Problema**: Cuando un usuario compra un driver del mercado "For Sale", el `acquisition_price` se establece al `asking_price` del vendedor, en lugar de volver al `base_price` del driver.

**Ubicación del Bug**: `f1_api/controllers/market_controller.py` - línea 442

```python
# ❌ INCORRECTO - mantiene el precio del vendedor
ownership.acquisition_price = price  # price = asking_price del vendedor
```

## 🎯 Especificación de Precios Correcta

### 1. **Market Price (Precio de Mercado)**
- **Definición**: Precio calculado dinámicamente según el rendimiento del driver
- **Fórmula**: `10,000,000 + (points × 10,000) + (podiums × 50,000) + (victories × 100,000)`
- **Ubicación**: `fantasy_stats.price` (calculado en backend)
- **Rango típico**: 10M - 30M (base 10M + bonificaciones por rendimiento)
- **Cuándo se usa**:
  - Al inicializar ownership en una liga nueva
  - Como referencia para calcular buyout y quick sell
  - **IMPORTANTE**: Debe ser el `acquisition_price` después de CUALQUIER compra

### 2. **Acquisition Price (Precio de Adquisición)**
- **Definición**: Precio al que el propietario actual adquirió el driver
- **Reglas**:
  - ✅ **SIEMPRE debe ser el precio de mercado actual** después de una compra
  - ✅ Al inicializar equipo: `acquisition_price = fantasy_stats.price`
  - ✅ Al comprar del mercado libre: `acquisition_price = fantasy_stats.price`
  - ✅ Al comprar de usuario (for sale): `acquisition_price = base_price` (NO asking_price)
  - ✅ Al aplicar buyout clause: `acquisition_price = base_price`
  - ❌ **NUNCA** debe mantener el `asking_price` del vendedor anterior

### 3. **Asking Price (Precio de Venta)**
- **Definición**: Precio que el usuario establece cuando lista un driver para venta
- **Reglas**:
  - Solo existe cuando `is_listed_for_sale = true`
  - Por defecto: igual a `acquisition_price` si el usuario no especifica
  - Rango permitido: A discreción del usuario (sin límites definidos actualmente)
  - **IMPORTANTE**: Solo se usa durante la transacción de venta
  - Después de la venta: `asking_price = null` para el nuevo propietario

### 4. **Buyout Price (Precio de Buyout Clause)**
- **Definición**: Precio para forzar la compra de un driver de otro usuario
- **Fórmula**: `acquisition_price × 1.3` (130% del precio de adquisición)
- **Base**: Se calcula desde `acquisition_price` (que debe ser `base_price`)

### 5. **Quick Sell Refund (Reembolso Venta Rápida)**
- **Definición**: Cantidad devuelta al vender al mercado
- **Fórmula**: `acquisition_price × 0.8` (80% del precio de adquisición)
- **Base**: Se calcula desde `acquisition_price` (que debe ser `base_price`)

## 🔧 Cambios Necesarios

### Backend: `market_controller.py`

#### 1. Método `buy_driver_from_market` (línea ~334-380)
**Estado Actual**: ✅ CORRECTO
```python
# Execute purchase
ownership.owner_id = buyer_id
ownership.acquisition_price = price  # price = base_price (correcto)
ownership.locked_until = datetime.now() + timedelta(days=LOCK_DAYS_AFTER_PURCHASE)
```

#### 2. Método `buy_driver_from_user` (línea ~438-520)
**Estado Actual**: ❌ INCORRECTO - Necesita cambio

**Cambio Necesario**:
```python
# ANTES (INCORRECTO):
price = ownership.asking_price if ownership.asking_price else ownership.acquisition_price
# ...
ownership.acquisition_price = price  # ❌ Esto mantiene el asking_price

# DESPUÉS (CORRECTO):
price = ownership.asking_price if ownership.asking_price else ownership.acquisition_price

# Get driver's current base_price for new acquisition_price
from f1_api.models.repositories.drivers_repository import DriversRepository
drivers_repo = DriversRepository(self.session, CURRENT_SEASON)
driver = drivers_repo.get_driver_by_id(driver_id)

# Calcular base_price actual del driver
enriched = self._enrich_drivers_with_stats([driver])
base_price = enriched[0].get('fantasy_stats', {}).get('price', ownership.acquisition_price)

# Transfer ownership
ownership.owner_id = buyer_id
ownership.acquisition_price = base_price  # ✅ Usar base_price, NO price
ownership.is_listed_for_sale = False
ownership.asking_price = None  # Clear asking price
ownership.locked_until = datetime.now() + timedelta(days=LOCK_DAYS_AFTER_PURCHASE)
```

#### 3. Método `execute_buyout_clause` (línea ~711-867)
**Estado Actual**: Revisar - debería establecer `acquisition_price = base_price`

#### 4. Método `initialize_user_team_on_join` (línea ~152-270)
**Estado Actual**: ✅ CORRECTO (ya usa base_price durante inicialización)

### Frontend: Verificación

#### 1. `MarketDriverCard.tsx`
**Estado Actual**: ✅ CORRECTO
```tsx
const basePrice = driver.base_price || driver.fantasy_stats?.price || 0;
const acquisitionPrice = ownership?.acquisition_price || basePrice;
```

#### 2. Display de precios
**Estado Actual**: ✅ CORRECTO
- Free agents: muestra `basePrice`
- For sale: muestra `asking_price` (precio del vendedor)
- Owned: muestra `acquisition_price`
- Buyout: muestra `acquisition_price * 1.3`

## 📊 Flujo de Precios Correcto

### Escenario 1: Equipo Recién Creado
```
driver.base_price = 5,000,000
→ ownership.acquisition_price = 5,000,000
→ ownership.asking_price = null
```

### Escenario 2: Compra del Mercado Libre (Free Agent)
```
driver.base_price = 5,000,000
Compra → Paga 5,000,000
→ ownership.acquisition_price = 5,000,000 ✅
→ ownership.asking_price = null
```

### Escenario 3: Listar para Venta
```
ownership.acquisition_price = 5,000,000
Usuario lista por 7,000,000
→ ownership.asking_price = 7,000,000
→ ownership.is_listed_for_sale = true
→ ownership.acquisition_price = 5,000,000 (sin cambios)
```

### Escenario 4: Compra de Usuario (For Sale) - **PROBLEMA DETECTADO**
```
❌ INCORRECTO (estado actual):
Vendedor: acquisition_price = 5,000,000, asking_price = 7,000,000
Comprador paga: 7,000,000
→ ownership.acquisition_price = 7,000,000 ❌ MAL

✅ CORRECTO (debe ser):
Vendedor: acquisition_price = 5,000,000, asking_price = 7,000,000
driver.base_price = 5,000,000 (puede haber cambiado con actualizaciones)
Comprador paga: 7,000,000 (al vendedor)
→ ownership.acquisition_price = 5,000,000 ✅ (base_price actual)
→ ownership.asking_price = null
```

### Escenario 5: Quick Sell al Mercado
```
ownership.acquisition_price = 5,000,000
Vende al mercado
→ Recibe: 4,000,000 (80%)
→ ownership.owner_id = null
→ ownership.acquisition_price = 5,000,000 (sin cambios para siguiente comprador)
→ ownership.asking_price = null
```

### Escenario 6: Buyout Clause
```
Víctima: acquisition_price = 5,000,000
Comprador paga: 6,500,000 (130%)
driver.base_price = 5,000,000
→ ownership.acquisition_price = 5,000,000 ✅ (base_price actual)
→ ownership.asking_price = null
```

## 🎯 Puntos Clave

1. **`acquisition_price` SIEMPRE es `base_price`** después de cualquier compra
2. **`asking_price` es temporal** - solo existe durante el listing
3. **`base_price` es dinámico** - puede cambiar con actualizaciones de rendimiento
4. **Buyout y Quick Sell** se calculan desde `acquisition_price` (que es `base_price`)
5. **El comprador paga `asking_price`** pero **adquiere a `base_price`**

## ✅ Checklist de Implementación

- [ ] Actualizar `buy_driver_from_user` para usar `base_price` en `acquisition_price`
- [ ] Verificar `execute_buyout_clause` usa `base_price`
- [ ] Actualizar tests unitarios para validar precios
- [ ] Verificar en BD que drivers comprados tienen `acquisition_price = base_price`
- [ ] Documentar en API docs el comportamiento de precios
- [ ] Añadir validación en frontend para mostrar precio correcto
