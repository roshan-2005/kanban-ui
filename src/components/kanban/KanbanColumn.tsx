/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Card, CardStatus } from "@/lib/api/card.api";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { getStatusPillColor } from "@/lib/kanban.utils";

interface KanbanColumnProps {
  title: string;
  status: CardStatus;
  cards: Card[];
  onCardClick: (card: Card) => void;
  onDeleteClick: (card: Card) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  cards,
  onCardClick,
  onDeleteClick,
}) => {
  const filteredCards = cards.filter((card) => card.status === status);

  return (
    <div className="flex-1 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md transition-colors">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">{title}</h2>
      <Droppable droppableId={status}>
        {(provided: any) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3 min-h-[100px]"
          >
            {filteredCards.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No cards in this column.</p>
            ) : (
              filteredCards.map((card, index) => (
                <Draggable key={card.id} draggableId={String(card.id)} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => onCardClick(card)}
                    >
                      <div className="flex justify-between items-center mb-2 relative">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{card.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-1.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusPillColor(
                              card.status
                            )}`}
                          >
                            {card.status.replace(/_/g, " ")}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteClick(card);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {card.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{card.description}</p>
                      )}
                      {card.assigneeName && (
                        <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap bg-purple-200 dark:bg-purple-700 text-gray-800 dark:text-gray-100 mt-1">
                          Assignee: {card.assigneeName}
                        </span>
                      )}
                      {card.storyPoints !== undefined && (
                        <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap bg-green-200 dark:bg-green-700 text-gray-700 dark:text-gray-100 mt-1 ml-1">
                          SP: {card.storyPoints}
                        </span>
                      )}
                      {card.imgUrl && card.imgUrl.trim() !== "" && (
                        <div className="mt-2">
                          <img
                            src={card.imgUrl}
                            alt={card.title}
                            width={200}
                            height={120}
                            className="rounded-md object-cover w-full"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
