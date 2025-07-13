'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle, 
  HelpCircle,
  Shield,
  Heart,
  Star,
  Users,
  BookOpen,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { Button } from '@components/ui/button';
import { Card } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Select } from '@components/ui/select';
import { Badge } from '@components/ui/badge';
import { FadeIn } from '@components/animations/FadeIn';
import { SlideIn } from '@components/animations/SlideIn';
import { FormField } from '@components/forms/FormField';

import { trackEvent } from '@lib/analytics/tracker';
import { TRACKING_EVENTS } from '@utils/constants';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  userType: 'parent' | 'child' | 'mentor' | 'educator' | 'other';
}

export default function ContactClient() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    priority: 'medium',
    userType: 'parent',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const contactCategories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing & Subscriptions' },
    { value: 'safety', label: 'Child Safety & Privacy' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'bug', label: 'Report a Bug' },
    { value: 'mentor', label: 'Mentor Program' },
    { value: 'partnership', label: 'Partnership Inquiry' },
    { value: 'media', label: 'Media & Press' },
    { value: 'feedback', label: 'Feedback & Suggestions' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: '',
          message: '',
          priority: 'medium',
          userType: 'parent',
        });

        // Track contact form submission
        trackEvent(TRACKING_EVENTS.CONTACT_FORM_SUBMIT, {
          category: formData.category,
          userType: formData.userType,
          priority: formData.priority,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Support',
      content: 'hello@mintoons.com',
      description: 'Send us an email anytime',
      action: 'mailto:hello@mintoons.com',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      content: '+1 (555) 123-4567',
      description: 'Call us Monday-Friday, 9 AM - 6 PM PST',
      action: 'tel:+15551234567',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      content: 'Chat with us',
      description: 'Available 24/7 for urgent inquiries',
      action: '#',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: MapPin,
      title: 'Office Location',
      content: 'San Francisco, CA',
      description: '123 Creative Street, Suite 456',
      action: 'https://maps.google.com',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const quickHelp = [
    {
      icon: HelpCircle,
      title: 'FAQ',
      description: 'Find answers to common questions',
      href: '/help/faq',
    },
    {
      icon: Shield,
      title: 'Safety Guide',
      description: 'Learn about child safety features',
      href: '/safety',
    },
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'Help your child create their first story',
      href: '/help/getting-started',
    },
    {
      icon: Users,
      title: 'Parent Resources',
      description: 'Tips for supporting young writers',
      href: '/help/parents',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Parent of 8-year-old',
      content: 'The MINTOONS support team was incredibly helpful when we had questions about the mentor program.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Educator',
      content: 'Quick response time and thorough answers. They really understand what teachers need.',
      rating: 5,
    },
    {
      name: 'Emma Rodriguez',
      role: 'Parent of 12-year-old',
      content: 'I appreciated their patience in explaining the safety features. Very reassuring!',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              We're here to help!
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Get in <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Touch</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Have questions about MINTOONS? We're here to help! Whether you're a parent, educator, 
              or curious about our platform, we'd love to hear from you.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="info" size="lg" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Average response time: 2 hours
              </Badge>
              <Badge variant="success" size="lg" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                98% satisfaction rate
              </Badge>
            </div>
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <SlideIn direction="left">
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Send us a Message</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      label="Your Name"
                      error={errors.name}
                      required
                    >
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        disabled={isLoading}
                      />
                    </FormField>

                    <FormField
                      label="Email Address"
                      error={errors.email}
                      required
                    >
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        disabled={isLoading}
                      />
                    </FormField>
                  </div>

                  {/* User Type and Category */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField label="I am a..." required>
                      <Select
                        value={formData.userType}
                        onChange={(e) => setFormData({ ...formData, userType: e.target.value as any })}
                        disabled={isLoading}
                      >
                        <option value="parent">Parent/Guardian</option>
                        <option value="child">Child (with permission)</option>
                        <option value="mentor">Mentor</option>
                        <option value="educator">Educator/Teacher</option>
                        <option value="other">Other</option>
                      </Select>
                    </FormField>

                    <FormField
                      label="Category"
                      error={errors.category}
                      required
                    >
                      <Select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        disabled={isLoading}
                      >
                        <option value="">Select a category</option>
                        {contactCategories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  </div>

                  {/* Subject */}
                  <FormField
                    label="Subject"
                    error={errors.subject}
                    required
                  >
                    <Input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief description of your inquiry"
                      disabled={isLoading}
                    />
                  </FormField>

                  {/* Priority */}
                  <FormField label="Priority Level">
                    <div className="flex gap-3">
                      {[
                        { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700' },
                        { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
                        { value: 'high', label: 'High', color: 'bg-red-100 text-red-700' },
                      ].map((priority) => (
                        <button
                          key={priority.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: priority.value as any })}
                          disabled={isLoading}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.priority === priority.value
                              ? priority.color
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {priority.label}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  {/* Message */}
                  <FormField
                    label="Message"
                    error={errors.message}
                    required
                  >
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please provide details about your inquiry..."
                      rows={6}
                      disabled={isLoading}
                    />
                  </FormField>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-lg py-3"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </SlideIn>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <SlideIn direction="right" delay={0.2}>
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  Other Ways to Reach Us
                </h3>

                <div className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-10 h-10 bg-gradient-to-br ${info.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <info.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">{info.title}</h4>
                        <p className="text-sm text-purple-600 font-medium">{info.content}</p>
                        <p className="text-xs text-gray-500 mt-1">{info.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </SlideIn>

            {/* Quick Help */}
            <SlideIn direction="right" delay={0.3}>
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  Quick Help
                </h3>

                <div className="space-y-3">
                  {quickHelp.map((help, index) => (
                    <Link key={index} href={help.href}>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors group">
                        <help.icon className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-purple-700">
                            {help.title}
                          </div>
                          <div className="text-sm text-gray-600">
                            {help.description}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            </SlideIn>

            {/* Testimonials */}
            <SlideIn direction="right" delay={0.4}>
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  What People Say
                </h3>

                <div className="space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        "{testimonial.content}"
                      </p>
                      <div className="text-xs text-gray-600">
                        <div className="font-medium">{testimonial.name}</div>
                        <div>{testimonial.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </SlideIn>
          </div>
        </div>

        {/* FAQ Section */}
        <FadeIn delay={0.5}>
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 mb-8">
              Find quick answers to common questions
            </p>
            <Link href="/help/faq">
              <Button variant="outline" size="lg">
                <HelpCircle className="w-4 h-4 mr-2" />
                Browse FAQ
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}