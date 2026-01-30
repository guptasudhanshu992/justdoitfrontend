/**
 * Admin Dashboard Component
 * Displays blog statistics and analytics overview
 * Uses Recharts for data visualization with Chakra UI styling
 */

import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Icon,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Link,
  Button,
  Divider,
} from "@chakra-ui/react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Link as RouterLink } from "react-router-dom";
import { blogsApi, categoriesApi, tagsApi, mediaApi } from "../../services/api";
import { isGAEnabled } from "../../hooks/useAnalytics";

// Icons as simple components
const FileTextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

const FolderIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const TagIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const ImageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21,15 16,10 5,21" />
  </svg>
);

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
    <polyline points="17,6 23,6 23,12" />
  </svg>
);

// Chart colors that work with both light and dark modes
const CHART_COLORS = ["#3182CE", "#38A169", "#D69E2E", "#E53E3E", "#805AD5", "#DD6B20"];

export default function DashboardContent() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalCategories: 0,
    totalTags: 0,
    totalMedia: 0,
    totalWords: 0,
    avgReadingTime: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [postsOverTime, setPostsOverTime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const mutedColor = useColorModeValue("gray.600", "gray.400");
  const chartGridColor = useColorModeValue("#E2E8F0", "#4A5568");

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel
        const [postsData, categoriesData, tagsData, mediaData] = await Promise.all([
          blogsApi.getAll().catch(() => []),
          categoriesApi.getAll().catch(() => []),
          tagsApi.getAll().catch(() => []),
          mediaApi.getAll().catch(() => ({ files: [] })),
        ]);

        // Normalize responses
        const posts = Array.isArray(postsData) ? postsData : (postsData?.data || postsData?.results || []);
        const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);
        const tags = Array.isArray(tagsData) ? tagsData : (tagsData?.data || []);
        const media = mediaData?.files || [];

        // Calculate stats
        const publishedPosts = posts.filter((p) => p.status === "published");
        const draftPosts = posts.filter((p) => p.status === "draft");
        const totalWords = posts.reduce((sum, p) => sum + (p.word_count || 0), 0);
        const avgReadingTime = posts.length > 0
          ? Math.round(posts.reduce((sum, p) => sum + (p.reading_time || 0), 0) / posts.length)
          : 0;

        setStats({
          totalPosts: posts.length,
          publishedPosts: publishedPosts.length,
          draftPosts: draftPosts.length,
          totalCategories: categories.length,
          totalTags: tags.length,
          totalMedia: media.length,
          totalWords,
          avgReadingTime,
        });

        // Recent posts (last 5)
        const sortedPosts = [...posts].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setRecentPosts(sortedPosts.slice(0, 5));

        // Category distribution for pie chart
        const catCounts = {};
        posts.forEach((post) => {
          if (post.categories && post.categories.length > 0) {
            post.categories.forEach((cat) => {
              const catName = typeof cat === "string" ? cat : cat.name;
              catCounts[catName] = (catCounts[catName] || 0) + 1;
            });
          } else {
            catCounts["Uncategorized"] = (catCounts["Uncategorized"] || 0) + 1;
          }
        });
        setCategoryData(
          Object.entries(catCounts).map(([name, value]) => ({ name, value }))
        );

        // Posts over time (last 6 months)
        const monthCounts = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = date.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          });
          monthCounts[monthKey] = 0;
        }
        posts.forEach((post) => {
          const postDate = new Date(post.created_at);
          const monthKey = postDate.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          });
          if (monthCounts.hasOwnProperty(monthKey)) {
            monthCounts[monthKey]++;
          }
        });
        setPostsOverTime(
          Object.entries(monthCounts).map(([month, posts]) => ({ month, posts }))
        );
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format number with commas
  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          bg={cardBg}
          p={3}
          borderRadius="md"
          boxShadow="lg"
          border="1px"
          borderColor={borderColor}
        >
          <Text fontWeight="bold" color={textColor}>
            {label}
          </Text>
          {payload.map((entry, index) => (
            <Text key={index} color={entry.color}>
              {entry.name}: {entry.value}
            </Text>
          ))}
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color={mutedColor}>Loading dashboard...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box mb={8}>
        <Heading size="lg" color={textColor} mb={2}>
          Dashboard
        </Heading>
        <Text color={mutedColor}>
          Overview of your blog performance and content statistics
        </Text>
      </Box>

      {/* Google Analytics Status */}
      {!isGAEnabled() && (
        <Alert status="info" mb={6} borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Google Analytics Not Configured</AlertTitle>
            <AlertDescription>
              Add your GA4 Measurement ID to the{" "}
              <Text as="code" bg="gray.100" px={1} borderRadius="sm">
                .env
              </Text>{" "}
              file to enable real-time analytics tracking.{" "}
              <Link
                href="https://analytics.google.com"
                isExternal
                color="blue.500"
                textDecoration="underline"
              >
                Get your Measurement ID from Google Analytics →
              </Link>
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {isGAEnabled() && (
        <Alert status="success" mb={6} borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Google Analytics Active</AlertTitle>
            <AlertDescription>
              Page views and events are being tracked.{" "}
              <Link
                href="https://analytics.google.com"
                isExternal
                color="blue.500"
                textDecoration="underline"
              >
                View detailed analytics in Google Analytics →
              </Link>
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={6}
        mb={8}
      >
        {/* Total Posts */}
        <GridItem>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Flex justify="space-between" align="flex-start">
                <Box>
                  <Text color={mutedColor} fontSize="sm" fontWeight="medium">
                    Total Posts
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color={textColor} mt={1}>
                    {formatNumber(stats.totalPosts)}
                  </Text>
                  <HStack spacing={2} mt={2}>
                    <Badge colorScheme="green">{stats.publishedPosts} Published</Badge>
                    <Badge colorScheme="yellow">{stats.draftPosts} Drafts</Badge>
                  </HStack>
                </Box>
                <Box color="blue.500" p={2} bg="blue.50" borderRadius="lg">
                  <FileTextIcon />
                </Box>
              </Flex>
            </CardBody>
          </Card>
        </GridItem>

        {/* Categories */}
        <GridItem>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Flex justify="space-between" align="flex-start">
                <Box>
                  <Text color={mutedColor} fontSize="sm" fontWeight="medium">
                    Categories
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color={textColor} mt={1}>
                    {formatNumber(stats.totalCategories)}
                  </Text>
                  <Text color={mutedColor} fontSize="sm" mt={2}>
                    Content organization
                  </Text>
                </Box>
                <Box color="green.500" p={2} bg="green.50" borderRadius="lg">
                  <FolderIcon />
                </Box>
              </Flex>
            </CardBody>
          </Card>
        </GridItem>

        {/* Tags */}
        <GridItem>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Flex justify="space-between" align="flex-start">
                <Box>
                  <Text color={mutedColor} fontSize="sm" fontWeight="medium">
                    Tags
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color={textColor} mt={1}>
                    {formatNumber(stats.totalTags)}
                  </Text>
                  <Text color={mutedColor} fontSize="sm" mt={2}>
                    Topic labels
                  </Text>
                </Box>
                <Box color="purple.500" p={2} bg="purple.50" borderRadius="lg">
                  <TagIcon />
                </Box>
              </Flex>
            </CardBody>
          </Card>
        </GridItem>

        {/* Media Files */}
        <GridItem>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Flex justify="space-between" align="flex-start">
                <Box>
                  <Text color={mutedColor} fontSize="sm" fontWeight="medium">
                    Media Files
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color={textColor} mt={1}>
                    {formatNumber(stats.totalMedia)}
                  </Text>
                  <Text color={mutedColor} fontSize="sm" mt={2}>
                    Images & videos
                  </Text>
                </Box>
                <Box color="orange.500" p={2} bg="orange.50" borderRadius="lg">
                  <ImageIcon />
                </Box>
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Content Stats Row */}
      <Grid
        templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
        gap={6}
        mb={8}
      >
        {/* Total Words */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text color={mutedColor} fontSize="sm" fontWeight="medium">
                  Total Words Written
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color={textColor} mt={1}>
                  {formatNumber(stats.totalWords)}
                </Text>
              </Box>
              <Box color="teal.500" p={3} bg="teal.50" borderRadius="lg">
                <TrendingUpIcon />
              </Box>
            </Flex>
          </CardBody>
        </Card>

        {/* Avg Reading Time */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text color={mutedColor} fontSize="sm" fontWeight="medium">
                  Avg. Reading Time
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color={textColor} mt={1}>
                  {stats.avgReadingTime} min
                </Text>
              </Box>
              <Box color="pink.500" p={3} bg="pink.50" borderRadius="lg">
                <ClockIcon />
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </Grid>

      {/* Charts Row */}
      <Grid
        templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(2, 1fr)" }}
        gap={6}
        mb={8}
      >
        {/* Posts Over Time */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <Heading size="md" color={textColor}>
              Posts Published Over Time
            </Heading>
          </CardHeader>
          <CardBody>
            {postsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={postsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="month" stroke={mutedColor} fontSize={12} />
                  <YAxis stroke={mutedColor} fontSize={12} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="posts"
                    name="Posts"
                    fill="#3182CE"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Flex justify="center" align="center" h="250px">
                <Text color={mutedColor}>No data available</Text>
              </Flex>
            )}
          </CardBody>
        </Card>

        {/* Category Distribution */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <Heading size="md" color={textColor}>
              Posts by Category
            </Heading>
          </CardHeader>
          <CardBody>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Flex justify="center" align="center" h="250px">
                <Text color={mutedColor}>No categories found</Text>
              </Flex>
            )}
          </CardBody>
        </Card>
      </Grid>

      {/* Recent Posts Table */}
      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" mb={8}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md" color={textColor}>
              Recent Posts
            </Heading>
            <Button
              as={RouterLink}
              to="/admin/blog-posts"
              size="sm"
              colorScheme="blue"
              variant="outline"
            >
              View All
            </Button>
          </Flex>
        </CardHeader>
        <CardBody pt={0}>
          {recentPosts.length > 0 ? (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th color={mutedColor}>Title</Th>
                  <Th color={mutedColor}>Status</Th>
                  <Th color={mutedColor} isNumeric>
                    Words
                  </Th>
                  <Th color={mutedColor} isNumeric>
                    Read Time
                  </Th>
                  <Th color={mutedColor}>Created</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recentPosts.map((post) => (
                  <Tr key={post.id}>
                    <Td>
                      <Link
                        as={RouterLink}
                        to={`/admin/blog-posts/${post.id}/edit`}
                        color="blue.500"
                        fontWeight="medium"
                        _hover={{ textDecoration: "underline" }}
                      >
                        {post.title?.length > 50
                          ? post.title.substring(0, 50) + "..."
                          : post.title}
                      </Link>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={post.status === "published" ? "green" : "yellow"}
                      >
                        {post.status}
                      </Badge>
                    </Td>
                    <Td isNumeric>{formatNumber(post.word_count || 0)}</Td>
                    <Td isNumeric>{post.reading_time || 0} min</Td>
                    <Td>
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Flex justify="center" align="center" py={8}>
              <VStack spacing={4}>
                <Text color={mutedColor}>No posts yet</Text>
                <Button
                  as={RouterLink}
                  to="/admin/blog-posts/new"
                  colorScheme="blue"
                >
                  Create Your First Post
                </Button>
              </VStack>
            </Flex>
          )}
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
        <CardHeader>
          <Heading size="md" color={textColor}>
            Quick Actions
          </Heading>
        </CardHeader>
        <CardBody>
          <Grid
            templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
            gap={4}
          >
            <Button
              as={RouterLink}
              to="/admin/blog-posts/new"
              colorScheme="blue"
              size="lg"
              h="auto"
              py={4}
              flexDirection="column"
            >
              <Box mb={2}>
                <FileTextIcon />
              </Box>
              <Text fontSize="sm">New Post</Text>
            </Button>
            <Button
              as={RouterLink}
              to="/admin/categories/new"
              colorScheme="green"
              size="lg"
              h="auto"
              py={4}
              flexDirection="column"
            >
              <Box mb={2}>
                <FolderIcon />
              </Box>
              <Text fontSize="sm">New Category</Text>
            </Button>
            <Button
              as={RouterLink}
              to="/admin/tags/new"
              colorScheme="purple"
              size="lg"
              h="auto"
              py={4}
              flexDirection="column"
            >
              <Box mb={2}>
                <TagIcon />
              </Box>
              <Text fontSize="sm">New Tag</Text>
            </Button>
            <Button
              as={RouterLink}
              to="/admin/media"
              colorScheme="orange"
              size="lg"
              h="auto"
              py={4}
              flexDirection="column"
            >
              <Box mb={2}>
                <ImageIcon />
              </Box>
              <Text fontSize="sm">Media Library</Text>
            </Button>
          </Grid>
        </CardBody>
      </Card>
    </Box>
  );
}
