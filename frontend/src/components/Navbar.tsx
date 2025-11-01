import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ChevronDown, Search, FileText, BookOpen, Heart, TrendingUp, Users, Briefcase, Building, BarChart3, Book, Star, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 mr-6 md:mr-8">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold text-lg">
              MegaJob
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center ml-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/" className="text-orange-500 font-medium hover:text-orange-600 transition-colors border-b-2 border-orange-500 pb-1 px-4 py-2">
                    Home
                  </Link>
                </NavigationMenuItem>
                
                {/* Jobs Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-blue-600 font-medium">
                    Jobs
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-64 p-2">
                      <Link to="/jobs" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md">
                        <Search className="w-4 h-4 mr-3" />
                        Browse All Jobs
                      </Link>
                      <Link to="/jobs?featured=true" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md">
                        <Star className="w-4 h-4 mr-3" />
                        Featured Jobs
                      </Link>
                      <Link to="/jobs?remote=true" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md">
                        <TrendingUp className="w-4 h-4 mr-3" />
                        Remote Jobs
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Employers Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-blue-600 font-medium">
                    Employers
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-64 p-2">
                      <Link to="/companies" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md">
                        <Building className="w-4 h-4 mr-3" />
                        All Companies
                      </Link>
                      <Link to="/companies?featured=true" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md">
                        <Star className="w-4 h-4 mr-3" />
                        Featured Companies
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2">
                    About
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/blogs" className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2">
                    Blogs
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2">
                    Contact
                  </Link>
                </NavigationMenuItem>

                {/* For Jobseekers Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-blue-600 font-medium">
                    For Jobseekers
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-64 p-2">
                      <Link to="/jobs" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md">
                        <Search className="w-4 h-4 mr-3" />
                        Browse Jobs
                      </Link>
                      <Link to="/resume-builder" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md">
                        <FileText className="w-4 h-4 mr-3" />
                        Resume Builder
                      </Link>
                      <Link to="/career-advice" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md">
                        <BookOpen className="w-4 h-4 mr-3" />
                        Career Advice
                      </Link>
                      <Link to="/salary-insights" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md">
                        <BarChart3 className="w-4 h-4 mr-3" />
                        Salary Insights
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* For Employers Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-blue-600 font-medium">
                    For Employers
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-64 p-2">
                      <Link to="/post-job" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md">
                        <Briefcase className="w-4 h-4 mr-3" />
                        Post a Job
                      </Link>
                      <Link to="/find-candidates" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md">
                        <Users className="w-4 h-4 mr-3" />
                        Find Candidates
                      </Link>
                      <Link to="/employer-resources" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-md">
                        <Book className="w-4 h-4 mr-3" />
                        Resources
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            {/* Authentication Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user?.role === 'jobseeker' && (
                  <div className="flex items-center space-x-4">
                    {user?.role === 'jobseeker' && (
                      <Link to="/jobseeker-dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                        Dashboard
                      </Link>
                    )}
                    {user?.role === 'employer' && (
                      <Link to="/employer/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                        Dashboard
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                        Admin
                      </Link>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <span>{user?.name}</span>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to="/profile">
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Button asChild>
                      <Link to="/login">
                        Login / Register
                      </Link>
                    </Button>
                  </div>
                )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link to="/" className="text-orange-500 font-medium hover:text-orange-600 transition-colors">
                    Home
                  </Link>
                  
                  <div className="space-y-2">
                    <div className="font-semibold text-gray-900">Jobs</div>
                    <div className="pl-4 space-y-2">
                      <Link to="/jobs" className="flex items-center text-gray-600 hover:text-blue-600">
                        <Search className="w-4 h-4 mr-2" />
                        Browse All Jobs
                      </Link>
                      <Link to="/jobs?featured=true" className="flex items-center text-gray-600 hover:text-blue-600">
                        <Star className="w-4 h-4 mr-2" />
                        Featured Jobs
                      </Link>
                      <Link to="/jobs?remote=true" className="flex items-center text-gray-600 hover:text-blue-600">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Remote Jobs
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-semibold text-gray-900">Employers</div>
                    <div className="pl-4 space-y-2">
                      <Link to="/companies" className="flex items-center text-gray-600 hover:text-blue-600">
                        <Building className="w-4 h-4 mr-2" />
                        All Companies
                      </Link>
                      <Link to="/companies?featured=true" className="flex items-center text-gray-600 hover:text-blue-600">
                        <Star className="w-4 h-4 mr-2" />
                        Featured Companies
                      </Link>
                    </div>
                  </div>

                  <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium">
                    About
                  </Link>
                  <Link to="/blogs" className="text-gray-700 hover:text-blue-600 font-medium">
                    Blogs
                  </Link>
                  <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium">
                    Contact
                  </Link>

                  <div className="space-y-2">
                    <div className="font-semibold text-gray-900">For Jobseekers</div>
                    <div className="pl-4 space-y-2">
                      <Link to="/jobs" className="flex items-center text-gray-600 hover:text-blue-600">
                        <Search className="w-4 h-4 mr-2" />
                        Browse Jobs
                      </Link>
                      <Link to="/resume-builder" className="flex items-center text-gray-600 hover:text-blue-600">
                        <FileText className="w-4 h-4 mr-2" />
                        Resume Builder
                      </Link>
                      <Link to="/career-advice" className="flex items-center text-gray-600 hover:text-blue-600">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Career Advice
                      </Link>
                      <Link to="/salary-insights" className="flex items-center text-gray-600 hover:text-blue-600">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Salary Insights
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-semibold text-gray-900">For Employers</div>
                    <div className="pl-4 space-y-2">
                      <Link to="/post-job" className="flex items-center text-gray-600 hover:text-blue-600">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Post a Job
                      </Link>
                      <Link to="/find-candidates" className="flex items-center text-gray-600 hover:text-blue-600">
                        <Users className="w-4 h-4 mr-2" />
                        Find Candidates
                      </Link>
                      <Link to="/employer-resources" className="flex items-center text-gray-600 hover:text-blue-600">
                        <Book className="w-4 h-4 mr-2" />
                        Resources
                      </Link>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    {isAuthenticated ? (
                      <div className="space-y-2">
                        {user?.role === 'jobseeker' && (
                          <Link to="/jobseeker-dashboard" className="block text-gray-700 hover:text-blue-600 font-medium">
                            Dashboard
                          </Link>
                        )}
                        {user?.role === 'employer' && (
                          <Link to="/employer/dashboard" className="block text-gray-700 hover:text-blue-600 font-medium">
                            Dashboard
                          </Link>
                        )}
                        {user?.role === 'admin' && (
                          <Link to="/admin/dashboard" className="block text-gray-700 hover:text-blue-600 font-medium">
                            Admin
                          </Link>
                        )}
                        <Link to="/profile" className="block text-gray-700 hover:text-blue-600 font-medium">
                          Profile
                        </Link>
                        <Button onClick={handleLogout} variant="destructive" className="w-full">
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <Button asChild className="w-full">
                        <Link to="/login">
                          Login / Register
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>


        
      </div>
    </nav>
  );
};

export default Navbar;