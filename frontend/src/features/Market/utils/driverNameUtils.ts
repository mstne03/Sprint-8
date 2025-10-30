/**
 * Extract last name from driver's full name
 * @param fullName - Driver's full name (e.g., "Max Verstappen")
 * @returns Last name (e.g., "Verstappen")
 */
export const getDriverLastName = (fullName: string): string => {
    const nameParts = fullName.trim().split(' ');
    return nameParts[nameParts.length - 1];
};
