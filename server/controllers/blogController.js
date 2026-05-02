import { Blog } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

export const getAllBlogs = async (req, res) => {
    try {
        const { publishedOnly = 'true' } = req.query;
        const where = publishedOnly === 'true' ? { is_published: true } : {};
        
        const blogs = await Blog.findAll({
            where,
            order: [['published_at', 'DESC'], ['created_at', 'DESC']]
        });
        res.json(blogs);
    } catch (error) {
        console.error('[Blog] getAllBlogs error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

export const getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const blog = await Blog.findOne({ where: { slug } });
        if (!blog) return res.status(404).json({ error: 'Article non trouvé' });
        res.json(blog);
    } catch (error) {
        console.error('[Blog] getBlogBySlug error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

export const createBlog = async (req, res) => {
    try {
        const { title, summary, content, image_url, category, tags, meta_title, meta_description, is_published } = req.body;
        
        // Slug generation
        const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now();
        
        const blog = await Blog.create({
            id: uuidv4(),
            title,
            slug,
            summary,
            content,
            image_url,
            category,
            tags,
            meta_title: meta_title || title,
            meta_description: meta_description || summary,
            is_published,
            published_at: is_published ? new Date() : null,
            author_id: req.auth.userId
        });
        res.status(201).json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findByPk(id);
        if (!blog) return res.status(404).json({ error: 'Article non trouvé' });

        const { is_published } = req.body;
        const updateData = { ...req.body };
        
        if (is_published && !blog.is_published) {
            updateData.published_at = new Date();
        }

        await blog.update(updateData);
        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findByPk(id);
        if (!blog) return res.status(404).json({ error: 'Article non trouvé' });
        await blog.destroy();
        res.json({ message: 'Article supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
