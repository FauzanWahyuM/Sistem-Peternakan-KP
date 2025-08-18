// Static implementation of Questionnaire model
const staticQuestionnaires = [
  {
    id: '1',
    userId: '2', // penyuluh user
    judul: 'Kuesioner Kesehatan Ternak',
    deskripsi: 'Kuesioner untuk menilai kesehatan ternak secara berkala',
    pertanyaan: [
      {
        id: 'q1',
        text: 'Bagaimana kondisi kesehatan ternak Anda saat ini?',
        type: 'text'
      },
      {
        id: 'q2',
        text: 'Apakah ternak Anda mendapatkan vaksinasi secara rutin?',
        type: 'boolean'
      }
    ],
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  }
];

// Static implementation of QuestionnaireResponse model
const staticQuestionnaireResponses = [
  {
    id: '1',
    questionnaireId: '1',
    userId: '3', // peternak user
    jawaban: [
      {
        questionId: 'q1',
        answer: 'Ternak dalam keadaan sehat'
      },
      {
        questionId: 'q2',
        answer: true
      }
    ],
    submittedAt: new Date('2025-01-20')
  }
];

export class QuestionnaireModel {
  static async create(questionnaireData) {
    // In static implementation, we'll just add to the array
    const newQuestionnaire = {
      id: String(staticQuestionnaires.length + 1),
      ...questionnaireData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    staticQuestionnaires.push(newQuestionnaire);
    return newQuestionnaire;
  }

  static async findById(id) {
    return staticQuestionnaires.find(q => q.id === id);
  }

  static async findByUserId(userId) {
    return staticQuestionnaires.filter(q => q.userId === userId);
  }

  static async findAll() {
    return staticQuestionnaires;
  }

  static async updateById(id, updateData) {
    const index = staticQuestionnaires.findIndex(q => q.id === id);
    if (index === -1) return false;
    
    staticQuestionnaires[index] = {
      ...staticQuestionnaires[index],
      ...updateData,
      updatedAt: new Date()
    };
    
    return true;
  }

  static async deleteById(id) {
    const index = staticQuestionnaires.findIndex(q => q.id === id);
    if (index === -1) return false;
    
    staticQuestionnaires.splice(index, 1);
    return true;
  }

  static async deleteByUserId(userId) {
    const initialLength = staticQuestionnaires.length;
    for (let i = staticQuestionnaires.length - 1; i >= 0; i--) {
      if (staticQuestionnaires[i].userId === userId) {
        staticQuestionnaires.splice(i, 1);
      }
    }
    
    return initialLength - staticQuestionnaires.length;
  }

  static async searchByTitle(searchTerm) {
    return staticQuestionnaires.filter(q => 
      q.judul.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}

export class QuestionnaireResponseModel {
  static async create(responseData) {
    // In static implementation, we'll just add to the array
    const newResponse = {
      id: String(staticQuestionnaireResponses.length + 1),
      ...responseData,
      submittedAt: new Date()
    };
    
    staticQuestionnaireResponses.push(newResponse);
    return newResponse;
  }

  static async findByQuestionnaireId(questionnaireId) {
    return staticQuestionnaireResponses.filter(r => r.questionnaireId === questionnaireId);
  }

  static async findByUserId(userId) {
    return staticQuestionnaireResponses.filter(r => r.userId === userId);
  }

  static async findByQuestionnaireAndUser(questionnaireId, userId) {
    return staticQuestionnaireResponses.find(r => 
      r.questionnaireId === questionnaireId && r.userId === userId
    );
  }

  static async findAll() {
    return staticQuestionnaireResponses;
  }

  static async deleteById(id) {
    const index = staticQuestionnaireResponses.findIndex(r => r.id === id);
    if (index === -1) return false;
    
    staticQuestionnaireResponses.splice(index, 1);
    return true;
  }

  static async deleteByQuestionnaireId(questionnaireId) {
    const initialLength = staticQuestionnaireResponses.length;
    for (let i = staticQuestionnaireResponses.length - 1; i >= 0; i--) {
      if (staticQuestionnaireResponses[i].questionnaireId === questionnaireId) {
        staticQuestionnaireResponses.splice(i, 1);
      }
    }
    
    return initialLength - staticQuestionnaireResponses.length;
  }

  static async deleteByUserId(userId) {
    const initialLength = staticQuestionnaireResponses.length;
    for (let i = staticQuestionnaireResponses.length - 1; i >= 0; i--) {
      if (staticQuestionnaireResponses[i].userId === userId) {
        staticQuestionnaireResponses.splice(i, 1);
      }
    }
    
    return initialLength - staticQuestionnaireResponses.length;
  }
}