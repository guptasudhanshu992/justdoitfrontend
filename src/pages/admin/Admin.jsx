import { VStack, Box, useColorModeValue } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import AdminSidebar from "../../components/layout/AdminSidebar";
import BlogPostsContent from "./BlogPostsContent";
import BlogPostPage from "./BlogPostPage";
import CategoriesContent from "./CategoriesContent";
import CategoryPage from "./CategoryPage";
import TagsContent from "./TagsContent";
import TagPage from "./TagPage";
import MediaContent from "./MediaContent";

export default function AdminDashboard() {
  const textColor = useColorModeValue("gray.900", "gray.50");

  return (
    <VStack width="100%" align="stretch" spacing={0}>
      <AdminLayout sidebar={<AdminSidebar />}>
        <Routes>
          <Route path="/" element={<Box color={textColor}>Welcome to Admin Dashboard</Box>} />
          <Route path="/blog-posts" element={<BlogPostsContent />} />
          <Route path="/blog-posts/new" element={<BlogPostPage />} />
          <Route path="/blog-posts/:id/edit" element={<BlogPostPage />} />
          <Route path="/categories" element={<CategoriesContent />} />
          <Route path="/categories/new" element={<CategoryPage />} />
          <Route path="/categories/:id/edit" element={<CategoryPage />} />
          <Route path="/tags" element={<TagsContent />} />
          <Route path="/tags/new" element={<TagPage />} />
          <Route path="/tags/:id/edit" element={<TagPage />} />
          <Route path="/media" element={<MediaContent />} />
        </Routes>
      </AdminLayout>
    </VStack>
  );
}
