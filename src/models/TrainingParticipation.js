// Static implementation of TrainingParticipation model
const staticTrainingParticipations = [
  {
    id: '1',
    trainingId: '1',
    userId: '3', // peternak user
    status: 'registered',
    registrationDate: new Date('2025-01-15')
  },
  {
    id: '2',
    trainingId: '2',
    userId: '3', // peternak user
    status: 'completed',
    registrationDate: new Date('2025-02-01'),
    completionDate: new Date('2025-02-10')
  }
];

export class TrainingParticipationModel {
  static async create(participationData) {
    // In static implementation, we'll just add to the array
    const newParticipation = {
      id: String(staticTrainingParticipations.length + 1),
      ...participationData,
      registrationDate: new Date()
    };
    
    staticTrainingParticipations.push(newParticipation);
    return newParticipation;
  }

  static async findById(id) {
    return staticTrainingParticipations.find(p => p.id === id);
  }

  static async findByTrainingId(trainingId) {
    return staticTrainingParticipations.filter(p => p.trainingId === trainingId);
  }

  static async findByUserId(userId) {
    return staticTrainingParticipations.filter(p => p.userId === userId);
  }

  static async findByTrainingAndUser(trainingId, userId) {
    return staticTrainingParticipations.find(p => 
      p.trainingId === trainingId && p.userId === userId
    );
  }

  static async findAll() {
    return staticTrainingParticipations;
  }

  static async updateStatus(id, status) {
    const participation = staticTrainingParticipations.find(p => p.id === id);
    if (!participation) return false;
    
    participation.status = status;
    if (status === 'completed') {
      participation.completionDate = new Date();
    }
    
    return true;
  }

  static async deleteById(id) {
    const index = staticTrainingParticipations.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    staticTrainingParticipations.splice(index, 1);
    return true;
  }

  static async deleteByTrainingId(trainingId) {
    const initialLength = staticTrainingParticipations.length;
    for (let i = staticTrainingParticipations.length - 1; i >= 0; i--) {
      if (staticTrainingParticipations[i].trainingId === trainingId) {
        staticTrainingParticipations.splice(i, 1);
      }
    }
    
    return initialLength - staticTrainingParticipations.length;
  }

  static async deleteByUserId(userId) {
    const initialLength = staticTrainingParticipations.length;
    for (let i = staticTrainingParticipations.length - 1; i >= 0; i--) {
      if (staticTrainingParticipations[i].userId === userId) {
        staticTrainingParticipations.splice(i, 1);
      }
    }
    
    return initialLength - staticTrainingParticipations.length;
  }

  static async getStatistics(userId) {
    const participations = userId 
      ? staticTrainingParticipations.filter(p => p.userId === userId)
      : staticTrainingParticipations;
    
    const stats = { registered: 0, completed: 0, cancelled: 0 };
    
    participations.forEach(p => {
      if (p.status === 'registered') {
        stats.registered++;
      } else if (p.status === 'completed') {
        stats.completed++;
      } else if (p.status === 'cancelled') {
        stats.cancelled++;
      }
    });
    
    return stats;
  }
}