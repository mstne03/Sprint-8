import type { DriverWithOwnership } from '@/features/Market/types/marketTypes';
import { formatCurrencyPrecise } from '@/features/Market/utils/currencyFormat';

interface DialogState {
    isOpen: boolean;
    type: 'confirm' | 'success' | 'error' | 'info';
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
}

interface UseMarketHandlersParams {
    leagueId: number;
    internalUserId: number;
    freeDrivers?: DriverWithOwnership[];
    forSaleDrivers?: DriverWithOwnership[];
    myDrivers?: DriverWithOwnership[];
    userBudget: number;
    userDriverCount: number;
    // Mutations
    buyFromMarket: any;
    buyFromUser: any;
    sellToMarket: any;
    listForSale: any;
    unlistFromSale: any;
    // Setters
    setBuyModalDriver: (driver: DriverWithOwnership | null) => void;
    setSellModalDriver: (driver: DriverWithOwnership | null) => void;
    setListModalDriver: (driver: DriverWithOwnership | null) => void;
    setDialog: (dialog: DialogState) => void;
    dialog: DialogState;
    // Modal drivers
    buyModalDriver: DriverWithOwnership | null;
    sellModalDriver: DriverWithOwnership | null;
    listModalDriver: DriverWithOwnership | null;
}

export const useMarketHandlers = ({
    leagueId,
    internalUserId,
    freeDrivers,
    forSaleDrivers,
    myDrivers,
    userBudget,
    userDriverCount,
    buyFromMarket,
    buyFromUser,
    sellToMarket,
    listForSale,
    unlistFromSale,
    setBuyModalDriver,
    setSellModalDriver,
    setListModalDriver,
    setDialog,
    dialog,
    buyModalDriver,
    sellModalDriver,
    listModalDriver,
}: UseMarketHandlersParams) => {
    const handleBuyFromMarket = (driverId: number) => {
        const driver = freeDrivers?.find(d => d.id === driverId);
        if (driver) {
            setBuyModalDriver(driver);
        }
    };

    const confirmBuyFromMarket = () => {
        if (!buyModalDriver || !leagueId) return;

        buyFromMarket(
            {
                leagueId,
                driverId: buyModalDriver.id,
                request: {
                    buyer_user_id: internalUserId,
                },
            },
            {
                onSuccess: () => {
                    setBuyModalDriver(null);
                    setDialog({
                        isOpen: true,
                        type: 'success',
                        title: 'Success!',
                        message: 'Driver purchased successfully!',
                        confirmText: 'OK',
                    });
                },
                onError: (error: any) => {
                    console.error('Error buying driver:', error);
                    const errorMessage = error?.response?.data?.detail?.message || error?.response?.data?.detail || 'Failed to buy driver';
                    setBuyModalDriver(null);
                    setDialog({
                        isOpen: true,
                        type: 'error',
                        title: 'Purchase Failed',
                        message: errorMessage,
                        confirmText: 'OK',
                    });
                },
            }
        );
    };

    const handleBuyFromUser = (driverId: number) => {
        const driver = forSaleDrivers?.find(d => d.id === driverId);
        if (!driver) return;

        // Use asking_price if available, otherwise fall back to acquisition_price or fantasy price
        const price = driver.ownership?.asking_price || driver.ownership?.acquisition_price || driver.fantasy_stats?.price || 0;
        const sellerId = driver.ownership?.owner_id;

        if (!sellerId) {
            setDialog({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: 'Seller information not found',
                confirmText: 'OK',
            });
            return;
        }

        const canAfford = userBudget >= price;
        const hasSpace = userDriverCount < 4;

        if (!hasSpace) {
            setDialog({
                isOpen: true,
                type: 'error',
                title: 'Maximum Drivers Reached',
                message: 'You already have 4 drivers. You cannot buy more until you sell one.',
                confirmText: 'OK',
            });
            return;
        }

        if (!canAfford) {
            setDialog({
                isOpen: true,
                type: 'error',
                title: 'Insufficient Budget',
                message: `You need ${formatCurrencyPrecise(price)} but only have ${formatCurrencyPrecise(userBudget)}`,
                confirmText: 'OK',
            });
            return;
        }

        setDialog({
            isOpen: true,
            type: 'confirm',
            title: 'Buy Driver',
            message: `Buy ${driver.full_name} for ${formatCurrencyPrecise(price)}?`,
            confirmText: 'Buy',
            onConfirm: () => {
                setDialog({ ...dialog, isOpen: false });
                buyFromUser(
                    {
                        leagueId,
                        driverId: driverId,
                        request: {
                            buyer_user_id: internalUserId,
                            seller_user_id: sellerId,
                        },
                    },
                    {
                        onSuccess: () => {
                            setDialog({
                                isOpen: true,
                                type: 'success',
                                title: 'Success!',
                                message: 'Driver purchased successfully!',
                                confirmText: 'OK',
                            });
                        },
                        onError: (error: any) => {
                            console.error('Error buying driver:', error);
                            const errorMessage = error?.response?.data?.detail?.message || error?.response?.data?.detail || 'Failed to buy driver';
                            setDialog({
                                isOpen: true,
                                type: 'error',
                                title: 'Purchase Failed',
                                message: errorMessage,
                                confirmText: 'OK',
                            });
                        },
                    }
                );
            },
        });
    };

    const handleSell = (driverId: number) => {
        const driver = myDrivers?.find(d => d.id === driverId);
        if (driver) {
            setSellModalDriver(driver);
        }
    };

    const confirmSell = () => {
        if (!sellModalDriver || !leagueId) return;

        sellToMarket(
            {
                leagueId,
                driverId: sellModalDriver.id,
                request: {
                    seller_user_id: internalUserId,
                },
            },
            {
                onSuccess: () => {
                    setSellModalDriver(null);
                    setDialog({
                        isOpen: true,
                        type: 'success',
                        title: 'Success!',
                        message: 'Driver sold successfully! 80% refunded to your budget.',
                        confirmText: 'OK',
                    });
                },
                onError: (error: any) => {
                    console.error('Error selling driver:', error);
                    const errorMessage = error?.response?.data?.detail?.message || error?.response?.data?.detail || 'Failed to sell driver';
                    setSellModalDriver(null);
                    setDialog({
                        isOpen: true,
                        type: 'error',
                        title: 'Sale Failed',
                        message: errorMessage,
                        confirmText: 'OK',
                    });
                },
            }
        );
    };

    const handleList = (driverId: number) => {
        const driver = myDrivers?.find(d => d.id === driverId);
        if (driver) {
            setListModalDriver(driver);
        }
    };

    const confirmList = (askingPrice: number) => {
        if (!listModalDriver || !leagueId) return;

        listForSale(
            {
                leagueId,
                driverId: listModalDriver.id,
                request: {
                    owner_user_id: internalUserId,
                    asking_price: askingPrice,
                },
            },
            {
                onSuccess: () => {
                    setListModalDriver(null);
                    setDialog({
                        isOpen: true,
                        type: 'success',
                        title: 'Listed for Sale!',
                        message: 'Your driver is now available in the "For Sale" tab.',
                        confirmText: 'OK',
                    });
                },
                onError: (error: any) => {
                    console.error('Error listing driver:', error);
                    const errorMessage = error?.response?.data?.detail?.message || error?.response?.data?.detail || 'Failed to list driver';
                    setListModalDriver(null);
                    setDialog({
                        isOpen: true,
                        type: 'error',
                        title: 'Listing Failed',
                        message: errorMessage,
                        confirmText: 'OK',
                    });
                },
            }
        );
    };

    const handleUnlist = (driverId: number) => {
        setDialog({
            isOpen: true,
            type: 'confirm',
            title: 'Unlist Driver',
            message: 'Remove this driver from sale listings?',
            confirmText: 'Unlist',
            onConfirm: () => {
                setDialog({ ...dialog, isOpen: false });
                unlistFromSale(
                    {
                        leagueId,
                        driverId: driverId,
                        request: {
                            owner_user_id: internalUserId,
                        },
                    },
                    {
                        onSuccess: () => {
                            setDialog({
                                isOpen: true,
                                type: 'success',
                                title: 'Unlisted!',
                                message: 'Driver removed from sale listings.',
                                confirmText: 'OK',
                            });
                        },
                        onError: (error: any) => {
                            console.error('Error unlisting driver:', error);
                            const errorMessage = error?.response?.data?.detail?.message || error?.response?.data?.detail || 'Failed to unlist driver';
                            setDialog({
                                isOpen: true,
                                type: 'error',
                                title: 'Unlist Failed',
                                message: errorMessage,
                                confirmText: 'OK',
                            });
                        },
                    }
                );
            },
        });
    };

    const handleBuyout = (driverId: number) => {
        console.log('Buyout:', driverId);
        // TODO: Mostrar modal de confirmación con replacement preview
    };

    return {
        handleBuyFromMarket,
        confirmBuyFromMarket,
        handleBuyFromUser,
        handleSell,
        confirmSell,
        handleList,
        confirmList,
        handleUnlist,
        handleBuyout,
    };
};
