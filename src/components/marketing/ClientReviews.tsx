import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  company: string;
  role: string;
  rating: number;
  review: string;
  avatar?: string;
  savings?: string;
  verified: boolean;
}

const reviews: Review[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    company: 'TechFlow Solutions',
    role: 'CFO',
    rating: 5,
    review: "PriceWise saved us $18,000 annually on our telecom expenses alone. The AI analysis is incredibly accurate and the recommendations are always actionable. It's like having a procurement expert on our team.",
    savings: '$18,000',
    verified: true
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    company: 'Green Valley Restaurant Group',
    role: 'Operations Manager',
    rating: 5,
    review: "We were overpaying for everything from utilities to software subscriptions. PriceWise identified savings we never would have found ourselves. ROI was immediate.",
    savings: '$12,500',
    verified: true
  },
  {
    id: '3',
    name: 'Emily Watson',
    company: 'Creative Design Studio',
    role: 'Business Owner',
    rating: 4,
    review: "Simple to use and incredibly effective. The platform quickly identified cheaper alternatives for our creative software subscriptions. Customer support is excellent too.",
    savings: '$3,200',
    verified: true
  },
  {
    id: '4',
    name: 'David Kim',
    company: 'Manufacturing Plus Inc.',
    role: 'Finance Director',
    rating: 5,
    review: "The detailed analysis reports are impressive. PriceWise not only found cost savings but also helped us negotiate better contracts with existing vendors. Highly recommend!",
    savings: '$25,000',
    verified: true
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    company: 'Wellness Center Network',
    role: 'CEO',
    rating: 5,
    review: "Outstanding platform! The AI recommendations are spot-on and the implementation support is fantastic. We've optimized our entire vendor ecosystem.",
    savings: '$8,900',
    verified: true
  },
  {
    id: '6',
    name: 'James Mitchell',
    company: 'Local Law Firm',
    role: 'Managing Partner',
    rating: 4,
    review: "Great tool for small businesses. Helped us cut our office expenses by 20% without compromising quality. The location-based recommendations are particularly useful.",
    savings: '$4,800',
    verified: true
  }
];

function StarRating({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating 
              ? 'fill-warning text-warning' 
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

export function ClientReviews() {
  const [currentReviews, setCurrentReviews] = useState(reviews.slice(0, 3));
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 3) % reviews.length;
        setCurrentReviews(reviews.slice(nextIndex, nextIndex + 3));
        return nextIndex;
      });
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const totalSavings = reviews.reduce((sum, review) => {
    const savings = parseInt(review.savings?.replace(/[^0-9]/g, '') || '0');
    return sum + savings;
  }, 0);

  return (
    <section className="py-20 bg-gradient-to-br from-muted/50 to-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <StarRating rating={Math.round(averageRating)} />
            <span className="text-lg font-semibold">{averageRating.toFixed(1)} out of 5</span>
            <Badge variant="secondary" className="ml-2">
              {reviews.length} reviews
            </Badge>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Trusted by Smart Business Owners and Consumers Worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of businesses saving money with PriceWise. Real results from real customers.
          </p>
          <div className="flex items-center justify-center gap-8 mt-8 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">${totalSavings.toLocaleString()}+</div>
              <div>Total Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{reviews.length}</div>
              <div>Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{Math.round(averageRating * 20)}%</div>
              <div>Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {currentReviews.map((review, index) => (
            <Card 
              key={`${review.id}-${currentIndex}`}
              className="modern-card animate-fade-in relative"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="h-8 w-8 text-primary/20 mb-4" />
                
                {/* Rating */}
                <div className="flex items-center justify-between mb-4">
                  <StarRating rating={review.rating} />
                  {review.verified && (
                    <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                      ✓ Verified
                    </Badge>
                  )}
                </div>

                {/* Review Text */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  "{review.review}"
                </p>

                {/* Savings Badge */}
                {review.savings && (
                  <div className="mb-4">
                    <Badge className="bg-success/10 text-success border-success/20">
                      Saved {review.savings} annually
                    </Badge>
                  </div>
                )}

                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={review.avatar} alt={review.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {review.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm">{review.name}</div>
                    <div className="text-xs text-muted-foreground">{review.role}</div>
                    <div className="text-xs text-muted-foreground font-medium">{review.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Review Indicators */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const startIndex = index * 3;
                setCurrentIndex(startIndex);
                setCurrentReviews(reviews.slice(startIndex, startIndex + 3));
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                Math.floor(currentIndex / 3) === index 
                  ? 'bg-primary scale-125' 
                  : 'bg-muted hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="grid md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">4.8/5</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">98%</div>
              <div className="text-sm text-muted-foreground">Would Recommend</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">24hrs</div>
              <div className="text-sm text-muted-foreground">Avg. Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">100%</div>
              <div className="text-sm text-muted-foreground">Money-Back Guarantee</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ClientReviews;