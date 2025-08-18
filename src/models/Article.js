// Static implementation of Article model
const staticArticles = [
  {
    id: '1',
    userId: '2', // penyuluh user
    judul: 'Panduan Lengkap Peternakan Modern',
    deskripsi: 'Panduan lengkap tentang teknik-teknik modern dalam peternakan',
    kategori: 'Peternakan',
    status: 'published',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: '2',
    userId: '2', // penyuluh user
    judul: 'Manajemen Pakan Ternak',
    deskripsi: 'Teknik manajemen pakan yang efektif untuk meningkatkan produktivitas ternak',
    kategori: 'Pakan',
    status: 'published',
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-01')
  }
];

export class ArticleModel {
  static async create(articleData) {
    // In static implementation, we'll just add to the array
    const newArticle = {
      id: String(staticArticles.length + 1),
      ...articleData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    staticArticles.push(newArticle);
    return newArticle;
  }

  static async findById(id) {
    return staticArticles.find(article => article.id === id);
  }

  static async findByUserId(userId) {
    return staticArticles.filter(article => article.userId === userId);
  }

  static async findAll() {
    return staticArticles;
  }

  static async findByStatus(status) {
    return staticArticles.filter(article => article.status === status);
  }

  static async findByCategory(category) {
    return staticArticles.filter(article => article.kategori === category);
  }

  static async searchByTitle(searchTerm) {
    return staticArticles.filter(article => 
      article.judul.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  static async updateById(id, updateData) {
    const index = staticArticles.findIndex(article => article.id === id);
    if (index === -1) return false;
    
    staticArticles[index] = {
      ...staticArticles[index],
      ...updateData,
      updatedAt: new Date()
    };
    
    return true;
  }

  static async deleteById(id) {
    const index = staticArticles.findIndex(article => article.id === id);
    if (index === -1) return false;
    
    staticArticles.splice(index, 1);
    return true;
  }

  static async deleteByUserId(userId) {
    const initialLength = staticArticles.length;
    for (let i = staticArticles.length - 1; i >= 0; i--) {
      if (staticArticles[i].userId === userId) {
        staticArticles.splice(i, 1);
      }
    }
    
    return initialLength - staticArticles.length;
  }

  static async getLatest(limit = 3) {
    return staticArticles
      .filter(article => article.status === 'published')
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  static async getStatistics(userId) {
    const articles = userId 
      ? staticArticles.filter(article => article.userId === userId)
      : staticArticles;
    
    const stats = { published: 0, draft: 0 };
    
    articles.forEach(article => {
      if (article.status === 'published') {
        stats.published++;
      } else if (article.status === 'draft') {
        stats.draft++;
      }
    });
    
    return stats;
  }
}