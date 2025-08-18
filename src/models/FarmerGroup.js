// Static implementation of FarmerGroup model
const staticFarmerGroups = [
  {
    id: '1',
    nama: 'Kelompok Ternak Maju',
    deskripsi: 'Kelompok peternak yang fokus pada pengembangan ternak sapi',
    anggota: [
      { userId: '3', nama: 'Peternak User', role: 'member', joinedAt: new Date('2025-01-01') }
    ],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  }
];

export class FarmerGroupModel {
  static async create(groupData) {
    // In static implementation, we'll just add to the array
    const newGroup = {
      id: String(staticFarmerGroups.length + 1),
      ...groupData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    staticFarmerGroups.push(newGroup);
    return newGroup;
  }

  static async findById(id) {
    return staticFarmerGroups.find(group => group.id === id);
  }

  static async findByName(name) {
    return staticFarmerGroups.find(group => group.nama === name);
  }

  static async findAll() {
    return staticFarmerGroups;
  }

  static async findByMember(userId) {
    return staticFarmerGroups.filter(group => 
      group.anggota && group.anggota.some(member => member.userId === userId)
    );
  }

  static async updateById(id, updateData) {
    const index = staticFarmerGroups.findIndex(group => group.id === id);
    if (index === -1) return false;
    
    staticFarmerGroups[index] = {
      ...staticFarmerGroups[index],
      ...updateData,
      updatedAt: new Date()
    };
    
    return true;
  }

  static async addMember(groupId, memberData) {
    const group = staticFarmerGroups.find(g => g.id === groupId);
    if (!group) return false;
    
    if (!group.anggota) {
      group.anggota = [];
    }
    
    group.anggota.push(memberData);
    group.updatedAt = new Date();
    return true;
  }

  static async removeMember(groupId, userId) {
    const group = staticFarmerGroups.find(g => g.id === groupId);
    if (!group || !group.anggota) return false;
    
    const initialLength = group.anggota.length;
    group.anggota = group.anggota.filter(member => member.userId !== userId);
    group.updatedAt = new Date();
    
    return initialLength > group.anggota.length;
  }

  static async deleteById(id) {
    const index = staticFarmerGroups.findIndex(group => group.id === id);
    if (index === -1) return false;
    
    staticFarmerGroups.splice(index, 1);
    return true;
  }

  static async searchByName(searchTerm) {
    return staticFarmerGroups.filter(group => 
      group.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  static async getStatistics() {
    const totalGroups = staticFarmerGroups.length;
    let totalMembers = 0;
    
    staticFarmerGroups.forEach(group => {
      if (group.anggota) {
        totalMembers += group.anggota.length;
      }
    });
    
    return { totalGroups, totalMembers };
  }
}