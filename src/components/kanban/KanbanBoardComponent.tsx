"use client";

import React, { useEffect, useState } from "react";
import { getCards, updateCard, Card, CardStatus } from "@/lib/api/card.api";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import KanbanColumn from "./KanbanColumn";
import CreateCardModal from "./CreateCardModal";
import UpdateCardModal from "./UpdateCardModal";
import DeleteCardModal from "./DeleteCardModal";
import { CARD_STATUS_OPTIONS } from "@/lib/kanban.utils";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

export default function KanbanBoardComponent() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const fetchedCards = await getCards();
      setCards(fetchedCards);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch cards");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (card: Card) => {
    setCardToDelete(card);
    setIsDeleteModalOpen(true);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId && destination.index === source.index)
    )
      return;

    const draggedCardId = Number(draggableId);
    const draggedCard = cards.find((card) => card.id === draggedCardId);
    if (!draggedCard) return;

    const newCards = Array.from(cards);
    const [removed] = newCards.splice(
      cards.findIndex((card) => card.id === draggedCardId),
      1
    );

    if (source.droppableId === destination.droppableId) {
      newCards.splice(destination.index, 0, removed);
      setCards(newCards);
    } else {
      const newStatus = destination.droppableId as CardStatus;
      removed.status = newStatus;
      newCards.splice(destination.index, 0, removed);
      setCards(newCards);

      // 🎉 Trigger confetti only when moving to DONE
      if (newStatus === "DONE") {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      try {
        await updateCard(draggedCardId, { status: newStatus });
      } catch (updateError) {
        console.error(updateError);
        fetchCards();
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        Loading Kanban Board...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg">
        Error: {error}
      </div>
    );

  return (
    <div
      className={`${
        darkMode ? "dark" : ""
      } flex flex-col h-screen p-6 bg-gray-50 dark:bg-black transition-colors`}
    >
      {/* Header with glass effect */}
      <div className="flex justify-between items-center mb-6 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-lg transition-colors">
        <h1
          className={`text-3xl font-bold transition-colors ${
            darkMode ? "text-green-400" : "text-blue-600"
          }`}
        >
          Kanban Board
        </h1>
        <div className="flex gap-2">
          <Button onClick={() => setDarkMode(!darkMode)} variant="outline">
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>
          <CreateCardModal
            isOpen={isCreateModalOpen}
            onOpenChange={setIsCreateModalOpen}
            onCardCreated={fetchCards}
          />
          <LogoutButton />
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-grow">
          {CARD_STATUS_OPTIONS.map((statusOption) => (
            <KanbanColumn
              key={statusOption}
              title={statusOption.replace(/_/g, " ")}
              status={statusOption}
              cards={cards}
              onCardClick={handleCardClick}
              onDeleteClick={handleDeleteClick}
            />
          ))}
        </div>
      </DragDropContext>

      <UpdateCardModal
        isOpen={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        card={selectedCard}
        onCardUpdated={fetchCards}
      />
      <DeleteCardModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        card={cardToDelete}
        onCardDeleted={fetchCards}
      />
    </div>
  );
}
