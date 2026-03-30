from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser


def answer_question(question, vector_store):
    retriever = vector_store.as_retriever()

    llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0)

    prompt = ChatPromptTemplate.from_template("""
    Answer the question based on the context below.

    Context: {context}
    Question: {question}
    """)

    chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain.invoke(question)
