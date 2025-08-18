// Static implementation of Livestock model
const staticLivestock = [
  {
    id: '1',
    userId: '3', // peternak user
    jenisHewan: 'Sapi',
    jenisKelamin: 'Betina',
    umurTernak: '3 tahun',
    statusTernak: 'Indukan',
    kondisiKesehatan: 'Sehat',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: '2',
    userId: '3', // peternak user
    jenisHewan: 'Kambing',
    jenisKelamin: 'Jantan',
    umurTernak: '2 tahun',
    statusTernak: 'Pejantan',
    kondisiKesehatan: 'Sehat',
    createdAt: new Date('2025-02-20'),
    updatedAt: new Date('2025-02-20')
  }
];

export class LivestockModel {
  static async create(livestockData) {
    // In static implementation, we'll just add to the array
    const newLivestock = {
      id: String(staticLivestock.length + 1),
      ...livestockData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    staticLivestock.push(newLivestock);
    return newLivestock;
  }

  static async findById(id) {
    return staticLivestock.find(livestock => livestock.id === id);
  }

  static async findByUserId(userId) {
    return staticLivestock.filter(livestock => livestock.userId === userId);
  }

  static async findByFilters(filters) {
    return staticLivestock.filter(livestock => {
      // Check each filter condition
      if (filters.userId && livestock.userId !== filters.userId) return false;
      if (filters.jenisHewan && livestock.jenisHewan !== filters.jenisHewan) return false;
      if (filters.jenisKelamin && livestock.jenisKelamin !== filters.jenisKelamin) return false;
      if (filters.statusTernak && livestock.statusTernak !== filters.statusTernak) return false;
      if (filters.kondisiKesehatan && livestock.kondisiKesehatan !== filters.kondisiKesehatan) return false;
      if (filters.umurTernak && !livestock.umurTernak.includes(filters.umurTernak)) return false;
      
      return true;
    });
  }

  static async updateById(id, updateData) {
    const index = staticLivestock.findIndex(livestock => livestock.id === id);
    if (index === -1) return false;
    
    staticLivestock[index] = {
      ...staticLivestock[index],
      ...updateData,
      updatedAt: new Date()
    };
    
    return true;
  }

  static async deleteById(id) {
    const index = staticLivestock.findIndex(livestock => livestock.id === id);
    if (index === -1) return false;
    
    staticLivestock.splice(index, 1);
    return true;
  }

  static async deleteByUserId(userId) {
    const initialLength = staticLivestock.length;
    for (let i = staticLivestock.length - 1; i >= 0; i--) {
      if (staticLivestock[i].userId === userId) {
        staticLivestock.splice(i, 1);
      }
    }
    
    return initialLength - staticLivestock.length;
  }

  static async findAll() {
    return staticLivestock;
  }

  static async getStatistics(userId) {
    const livestock = userId 
      ? staticLivestock.filter(livestock => livestock.userId === userId)
      : staticLivestock;
    
    // Group by jenisHewan
    const jenisHewanStats = {};
    livestock.forEach(item => {
      if (!jenisHewanStats[item.jenisHewan]) {
        jenisHewanStats[item.jenisHewan] = { total: 0, sehat: 0, sakit: 0 };
      }
      
      jenisHewanStats[item.jenisHewan].total++;
      if (item.kondisiKesehatan === 'Sehat') {
        jenisHewanStats[item.jenisHewan].sehat++;
      } else if (item.kondisiKesehatan === 'Sakit') {
        jenisHewanStats[item.jenisHewan].sakit++;
      }
    });
    
    // Convert to array format
    return Object.entries(jenisHewanStats).map(([jenisHewan, stats]) => ({
      _id: jenisHewan,
      ...stats
    }));
  }
}