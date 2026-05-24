from supabase import create_client
client = create_client("http://127.0.0.1:54321", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwa3Fyb2R6dGd3a2ViaW9ucWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjM0OTIsImV4cCI6MjA5MTYzOTQ5Mn0.PhYB-EFNRqMac0KFOo5piWnS5-xOfM8SJdxzyiVpMrM")
print(dir(client.auth))
