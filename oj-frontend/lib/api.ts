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

export const submitSolution = async ({
  code,
  language,
  questionId,
}: {
  code: string;
  language: string;
  questionId: string;
  }) => {
  const token = localStorage.getItem('token');
  if (token) {
    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      }, 
      body: JSON.stringify({
        code,
        language,
        questionId,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to submit solution");
    }
    return response.json();
  } else {
    throw new Error("Not Authenticated");
  }
};

export const fetchSubmissionStatus = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Failed to fetch submission status ${id}`);
  return response.json();
};

export const fetchProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not Authenticated');
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`Failed to fetch profile`);
    return response.json();
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch profile');
  }
};

export const fetchSolvedIds = async (): Promise<string[]> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [];
    const response = await fetch(`${API_BASE_URL}/user/solved`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.solvedIds;
  } catch {
    return [];
  }
};