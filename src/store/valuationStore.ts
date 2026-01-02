import { create } from 'zustand';

interface PropertyInfo {
  city: string;
  district: string;
  area: string;
  rooms: string;
  bathrooms: string;
  year: string;
  buildingType: string;
}

interface ValuationStore {
  propertyInfo: PropertyInfo;
  valuationResult: number | null;
  setPropertyInfo: (info: Partial<PropertyInfo>) => void;
  setValuationResult: (result: number | null) => void;
  resetPropertyInfo: () => void;
}

const useValuationStore = create<ValuationStore>((set) => ({
  propertyInfo: {
    city: '湘潭',
    district: '雨湖',
    area: '',
    rooms: '3',
    bathrooms: '2',
    year: '',
    buildingType: 'apartment',
  },
  valuationResult: null,

  setPropertyInfo: (info) =>
    set((state) => ({
      propertyInfo: { ...state.propertyInfo, ...info },
    })),

  setValuationResult: (result) => set({ valuationResult: result }),

  resetPropertyInfo: () =>
    set({
      propertyInfo: {
        city: '湘潭',
        district: '雨湖',
        area: '',
        rooms: '3',
        bathrooms: '2',
        year: '',
        buildingType: 'apartment',
      },
      valuationResult: null,
    }),
}));

export default useValuationStore;
