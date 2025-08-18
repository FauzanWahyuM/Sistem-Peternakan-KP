// Static implementation of TrainingProgram model
const staticTrainingPrograms = [
  {
    id: '1',
    userId: '2', // penyuluh user
    judul: 'Pelatihan Manajemen Pakan Ternak',
    deskripsi: 'Pelatihan tentang teknik manajemen pakan yang efektif',
    tanggal: new Date('2025-02-15'),
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10')
  },
  {
    id: '2',
    userId: '2', // penyuluh user
    judul: 'Pemahaman Kesehatan Ternak',
    deskripsi: 'Pelatihan tentang pengenalan gejala penyakit pada ternak',
    tanggal: new Date('2025-03-10'),
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-20')
  }
];

export class TrainingProgramModel {
  static async create(trainingData) {
    // In static implementation, we'll just add to the array
    const newTraining = {
      id: String(staticTrainingPrograms.length + 1),
      ...trainingData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    staticTrainingPrograms.push(newTraining);
    return newTraining;
  }

  static async findById(id) {
    return staticTrainingPrograms.find(t => t.id === id);
  }

  static async findByUserId(userId) {
    return staticTrainingPrograms.filter(t => t.userId === userId);
  }

  static async findAll() {
    return staticTrainingPrograms;
  }

  static async findByDateRange(startDate, endDate) {
    return staticTrainingPrograms.filter(t => {
      const trainingDate = new Date(t.tanggal);
      return trainingDate >= new Date(startDate) && trainingDate <= new Date(endDate);
    });
  }

  static async updateById(id, updateData) {
    const index = staticTrainingPrograms.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    staticTrainingPrograms[index] = {
      ...staticTrainingPrograms[index],
      ...updateData,
      updatedAt: new Date()
    };
    
    return true;
  }

  static async deleteById(id) {
    const index = staticTrainingPrograms.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    staticTrainingPrograms.splice(index, 1);
    return true;
  }

  static async deleteByUserId(userId) {
    const initialLength = staticTrainingPrograms.length;
    for (let i = staticTrainingPrograms.length - 1; i >= 0; i--) {
      if (staticTrainingPrograms[i].userId === userId) {
        staticTrainingPrograms.splice(i, 1);
      }
    }
    
    return initialLength - staticTrainingPrograms.length;
  }

  static async searchByTitle(searchTerm) {
    return staticTrainingPrograms.filter(t => 
      t.judul.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  static async getStatistics(userId) {
    const trainings = userId 
      ? staticTrainingPrograms.filter(t => t.userId === userId)
      : staticTrainingPrograms;
    
    const total = trainings.length;
    const now = new Date();
    let thisMonth = 0;
    let upcoming = 0;
    let past = 0;
    
    trainings.forEach(t => {
      const trainingDate = new Date(t.tanggal);
      // Check if training is in this month
      if (trainingDate.getMonth() === now.getMonth() && 
          trainingDate.getFullYear() === now.getFullYear()) {
        thisMonth++;
      }
      
      // Check if training is upcoming or past
      if (trainingDate > now) {
        upcoming++;
      } else {
        past++;
      }
    });
    
    return { total, thisMonth, upcoming, past };
  }
}