export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if(!API_BASE_URL) {
  throw new Error('API_BASE_URL is not defined');
}

export const fetchQuestionById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Failed to fetch question ${id}`);
  return response.json();
};

export const fetchQuestions = async () => {
  const response = await fetch(`${API_BASE_URL}/questions`,{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Failed to fetch questions`);
  return response.json();
};