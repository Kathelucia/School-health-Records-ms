import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ContactAdmin({ userProfile }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Find admin user(s)
    const { data: admins } = await supabase.from('profiles').select('id, email').eq('role', 'admin');
    if (!admins || admins.length === 0) {
      toast.error('No admin found.');
      setLoading(false);
      return;
    }
    // Insert notification or message (customize as needed)
    const { error } = await supabase.from('notifications').insert([
      {
        title: subject,
        message,
        user_id: admins[0].id, // send to first admin found
        type: 'admin_contact',
        related_id: userProfile?.id,
        related_table: 'profiles',
      }
    ]);
    if (!error) {
      toast.success('Message sent to admin!');
      setSubject('');
      setMessage('');
    } else {
      toast.error('Failed to send message.');
    }
    setLoading(false);
  };

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Contact System Administrator</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
          />
          <Textarea
            placeholder="Type your message here..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            required
          />
          <Button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Message'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
